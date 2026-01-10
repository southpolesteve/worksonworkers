#!/bin/bash

# Ralph Wiggum Development Loop for Works on Workers
# Usage: ./ralph.sh [iterations]
# Default: runs indefinitely until Ctrl+C

# NOTE: We intentionally do NOT use set -e here because:
# 1. Timeouts cause non-zero exit codes that we want to handle gracefully
# 2. We want the loop to continue even if individual iterations fail
cd "$(dirname "$0")"

ITERATIONS=${1:-0}  # 0 = infinite
COUNT=0
LOG_FILE="ralph-log.jsonl"
COST_FILE="ralph-costs.md"
TIMEOUT_SECONDS=${TIMEOUT:-1200}  # 20 min default, allow for longer investigation runs

# Session totals
SESSION_START=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SESSION_TOKENS=0
SESSION_COST="0"
SESSION_TIMEOUTS=0
MAX_SESSION_TIMEOUTS=10  # Allow more timeouts before giving up

# Colors (exported for subshells)
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export PURPLE='\033[0;35m'
export DIM='\033[2m'
export NC='\033[0m'

# Stream processor function - reads from temp file and displays progress
# Called with: stream_output <opencode_pid> <temp_file>
stream_output() {
    local OPENCODE_PID=$1
    local TEMP_OUTPUT=$2
    local last_line=0
    
    while kill -0 $OPENCODE_PID 2>/dev/null || [ -s "$TEMP_OUTPUT" ]; do
        # Read new lines from temp file
        if [ -f "$TEMP_OUTPUT" ]; then
            local current_lines=$(wc -l < "$TEMP_OUTPUT" 2>/dev/null || echo 0)
            if [ "$current_lines" -gt "$last_line" ]; then
                tail -n +$((last_line + 1)) "$TEMP_OUTPUT" 2>/dev/null | head -n $((current_lines - last_line)) | while IFS= read -r line; do
                    TS=$(date +"%H:%M:%S")
                    
                    # Parse the type field once
                    TYPE=$(echo "$line" | jq -r '.type // empty' 2>/dev/null)
                    
                    case "$TYPE" in
                        "text")
                            # Assistant's text response
                            TEXT=$(echo "$line" | jq -r '.part.text // empty' 2>/dev/null)
                            if [ -n "$TEXT" ]; then
                                # Wrap long text nicely
                                echo -e "${DIM}[$TS]${NC} ${TEXT}" | fold -s -w 80 | head -10
                            fi
                            ;;
                        "tool_use")
                            # Tool being called
                            TOOL=$(echo "$line" | jq -r '.part.tool // empty' 2>/dev/null)
                            STATUS=$(echo "$line" | jq -r '.part.state.status // empty' 2>/dev/null)
                            TITLE=$(echo "$line" | jq -r '.part.state.title // empty' 2>/dev/null)
                            
                            if [ -n "$TOOL" ]; then
                                if [ "$STATUS" = "completed" ]; then
                                    # Show tool completion with output
                                    OUTPUT=$(echo "$line" | jq -r '.part.state.output // empty' 2>/dev/null | head -c 800)
                                    echo -e "${GREEN}[$TS] ✓ $TOOL${NC}${TITLE:+ - $TITLE}"
                                    if [ -n "$OUTPUT" ]; then
                                        # Indent and truncate output
                                        echo "$OUTPUT" | head -8 | sed 's/^/        /' | while IFS= read -r outline; do
                                            echo -e "${DIM}${outline}${NC}"
                                        done
                                    fi
                                elif [ "$STATUS" = "pending" ] || [ "$STATUS" = "running" ]; then
                                    echo -e "${YELLOW}[$TS] ▶ $TOOL${NC}${TITLE:+ - $TITLE}"
                                else
                                    echo -e "${DIM}[$TS] ▶ $TOOL ($STATUS)${NC}${TITLE:+ - $TITLE}"
                                fi
                            fi
                            ;;
                        "step_start")
                            echo -e "${DIM}[$TS] --- thinking ---${NC}"
                            ;;
                        "step_finish")
                            REASON=$(echo "$line" | jq -r '.part.reason // empty' 2>/dev/null)
                            COST=$(echo "$line" | jq -r '.part.cost // 0' 2>/dev/null)
                            IN_TOK=$(echo "$line" | jq -r '.part.tokens.input // 0' 2>/dev/null)
                            OUT_TOK=$(echo "$line" | jq -r '.part.tokens.output // 0' 2>/dev/null)
                            CACHE_R=$(echo "$line" | jq -r '.part.tokens.cache.read // 0' 2>/dev/null)
                            echo -e "${DIM}[$TS] --- step done ($REASON) [in:$IN_TOK out:$OUT_TOK cache:$CACHE_R] [\$$COST] ---${NC}"
                            ;;
                    esac
                done
                last_line=$current_lines
            fi
        fi
        sleep 0.5
    done
    
    # Process any remaining lines after opencode exits
    if [ -f "$TEMP_OUTPUT" ]; then
        local final_lines=$(wc -l < "$TEMP_OUTPUT" 2>/dev/null || echo 0)
        if [ "$final_lines" -gt "$last_line" ]; then
            tail -n +$((last_line + 1)) "$TEMP_OUTPUT" 2>/dev/null | while IFS= read -r line; do
                TS=$(date +"%H:%M:%S")
                TYPE=$(echo "$line" | jq -r '.type // empty' 2>/dev/null)
                case "$TYPE" in
                    "text")
                        TEXT=$(echo "$line" | jq -r '.part.text // empty' 2>/dev/null)
                        [ -n "$TEXT" ] && echo -e "${DIM}[$TS]${NC} ${TEXT}" | fold -s -w 80 | head -10
                        ;;
                    "tool_use")
                        TOOL=$(echo "$line" | jq -r '.part.tool // empty' 2>/dev/null)
                        STATUS=$(echo "$line" | jq -r '.part.state.status // empty' 2>/dev/null)
                        TITLE=$(echo "$line" | jq -r '.part.state.title // empty' 2>/dev/null)
                        if [ -n "$TOOL" ]; then
                            if [ "$STATUS" = "completed" ]; then
                                OUTPUT=$(echo "$line" | jq -r '.part.state.output // empty' 2>/dev/null | head -c 800)
                                echo -e "${GREEN}[$TS] ✓ $TOOL${NC}${TITLE:+ - $TITLE}"
                                [ -n "$OUTPUT" ] && echo "$OUTPUT" | head -8 | sed 's/^/        /'
                            else
                                echo -e "${YELLOW}[$TS] ▶ $TOOL${NC}${TITLE:+ - $TITLE}"
                            fi
                        fi
                        ;;
                    "step_finish")
                        REASON=$(echo "$line" | jq -r '.part.reason // empty' 2>/dev/null)
                        COST=$(echo "$line" | jq -r '.part.cost // 0' 2>/dev/null)
                        echo -e "${DIM}[$TS] --- step done ($REASON) [\$$COST] ---${NC}"
                        ;;
                esac
            done
        fi
    fi
}

# Initialize cost tracking file if it doesn't exist
if [ ! -f "$COST_FILE" ]; then
    cat > "$COST_FILE" << 'EOF'
# Ralph Wiggum Cost Tracking

| Iteration | Timestamp | Duration (s) | Input Tokens | Output Tokens | Cache Read | Cache Write | Cost ($) | Cumulative ($) |
|-----------|-----------|--------------|--------------|---------------|------------|-------------|----------|----------------|
EOF
fi

# Log session start
echo "{\"event\": \"session_start\", \"timestamp\": \"$SESSION_START\"}" >> "$LOG_FILE"

clear
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║           🥔 RALPH WIGGUM DEVELOPMENT MODE 🥔              ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Cleanup function to log session end
cleanup() {
    SESSION_END=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "{\"event\": \"session_end\", \"timestamp\": \"$SESSION_END\", \"iterations\": $COUNT, \"session_tokens\": $SESSION_TOKENS, \"session_cost\": \"$SESSION_COST\"}" >> "$LOG_FILE"
    
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Session complete${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "  Iterations:     $COUNT"
    echo -e "  Session tokens: $SESSION_TOKENS"
    echo -e "  Session cost:   \$$SESSION_COST"
    echo ""
    exit 0
}

trap cleanup SIGINT SIGTERM

while true; do
    COUNT=$((COUNT + 1))
    
    if [ "$ITERATIONS" -gt 0 ] && [ "$COUNT" -gt "$ITERATIONS" ]; then
        cleanup
    fi
    
    TIMESTAMP=$(date +"%H:%M:%S")
    TIMESTAMP_FULL=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    START_TIME=$(date +%s)
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  Iteration $COUNT ${DIM}@ $TIMESTAMP${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Create temp file for full output
    TEMP_OUTPUT=$(mktemp)
    
    # Run opencode in background, capturing its PID directly
    opencode run --format json "$(cat PROMPT.md)" > "$TEMP_OUTPUT" 2>&1 &
    OPENCODE_PID=$!
    
    # Start the stream processor in background
    stream_output $OPENCODE_PID "$TEMP_OUTPUT" &
    STREAM_PID=$!
    
    # Wait for opencode with timeout
    TIMED_OUT=0
    ELAPSED=0
    while kill -0 $OPENCODE_PID 2>/dev/null; do
        sleep 5
        ELAPSED=$((ELAPSED + 5))
        if [ $ELAPSED -ge $TIMEOUT_SECONDS ]; then
            echo -e "${RED}⚠ Timeout after ${TIMEOUT_SECONDS}s - killing opencode${NC}"
            kill -TERM $OPENCODE_PID 2>/dev/null || true
            sleep 2
            kill -9 $OPENCODE_PID 2>/dev/null || true
            TIMED_OUT=1
            break
        fi
    done
    
    # Wait for opencode to fully exit (ignore exit code from wait if process was killed)
    wait $OPENCODE_PID 2>/dev/null || true
    EXIT_CODE=$?
    [ $TIMED_OUT -eq 1 ] && EXIT_CODE=124  # Use 124 like timeout command
    
    # Give the stream processor a moment to catch up, then kill it
    sleep 1
    kill $STREAM_PID 2>/dev/null || true
    wait $STREAM_PID 2>/dev/null || true
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    # Extract token usage and cost from step_finish events
    INPUT_TOKENS=0
    OUTPUT_TOKENS=0
    CACHE_READ=0
    CACHE_WRITE=0
    ITERATION_COST="0"
    
    if [ -f "$TEMP_OUTPUT" ]; then
        while IFS= read -r line; do
            if [[ "$line" =~ \"type\":\"step_finish\" ]]; then
                IN=$(echo "$line" | grep -o '"input":[0-9]*' | head -1 | cut -d':' -f2)
                [ -n "$IN" ] && INPUT_TOKENS=$((INPUT_TOKENS + IN))
                
                OUT=$(echo "$line" | grep -o '"output":[0-9]*' | head -1 | cut -d':' -f2)
                [ -n "$OUT" ] && OUTPUT_TOKENS=$((OUTPUT_TOKENS + OUT))
                
                CR=$(echo "$line" | grep -o '"read":[0-9]*' | cut -d':' -f2)
                [ -n "$CR" ] && CACHE_READ=$((CACHE_READ + CR))
                
                CW=$(echo "$line" | grep -o '"write":[0-9]*' | cut -d':' -f2)
                [ -n "$CW" ] && CACHE_WRITE=$((CACHE_WRITE + CW))
                
                COST=$(echo "$line" | grep -o '"cost":[0-9.]*' | cut -d':' -f2)
                [ -n "$COST" ] && ITERATION_COST=$(echo "scale=6; $ITERATION_COST + $COST" | bc 2>/dev/null || echo "$ITERATION_COST")
            fi
        done < "$TEMP_OUTPUT"
    fi
    
    TOTAL_TOKENS=$((INPUT_TOKENS + OUTPUT_TOKENS))
    
    # Update session totals
    SESSION_TOKENS=$((SESSION_TOKENS + TOTAL_TOKENS + CACHE_READ + CACHE_WRITE))
    SESSION_COST=$(echo "scale=4; $SESSION_COST + $ITERATION_COST" | bc 2>/dev/null || echo "$SESSION_COST")
    
    # Get cumulative cost (all time)
    PREV_CUMULATIVE=$(tail -1 "$COST_FILE" 2>/dev/null | awk -F'|' '{gsub(/[$[:space:]]/, "", $(NF-1)); print $(NF-1)}' | grep -E '^[0-9.]+$' || echo "0")
    [ -z "$PREV_CUMULATIVE" ] && PREV_CUMULATIVE="0"
    CUMULATIVE_COST=$(echo "scale=4; $PREV_CUMULATIVE + $ITERATION_COST" | bc 2>/dev/null || echo "$ITERATION_COST")
    
    # Log to JSONL
    TIMEOUT_FLAG=""
    [ $TIMED_OUT -eq 1 ] && TIMEOUT_FLAG=", \"timed_out\": true"
    echo "{\"iteration\": $COUNT, \"timestamp\": \"$TIMESTAMP_FULL\", \"duration_seconds\": $DURATION, \"exit_code\": $EXIT_CODE, \"input_tokens\": $INPUT_TOKENS, \"output_tokens\": $OUTPUT_TOKENS, \"cache_read\": $CACHE_READ, \"cache_write\": $CACHE_WRITE, \"cost_usd\": \"$ITERATION_COST\", \"cumulative_usd\": \"$CUMULATIVE_COST\", \"session_tokens\": $SESSION_TOKENS, \"session_cost\": \"$SESSION_COST\"$TIMEOUT_FLAG}" >> "$LOG_FILE"
    
    # Log to markdown
    echo "| $COUNT | $TIMESTAMP_FULL | $DURATION | $INPUT_TOKENS | $OUTPUT_TOKENS | $CACHE_READ | $CACHE_WRITE | \$$ITERATION_COST | \$$CUMULATIVE_COST |" >> "$COST_FILE"
    
    rm -f "$TEMP_OUTPUT"
    
    # Summary
    echo ""
    echo -e "${GREEN}✓ Iteration $COUNT done${NC} ${DIM}[${DURATION}s] [${TOTAL_TOKENS} tokens] [\$$ITERATION_COST]${NC}"
    
    # Get detailed stats from results directory
    if [ -d "packages/test-harness/results" ]; then
        WORKS=$(grep -l '"status": "works"' packages/test-harness/results/*.json 2>/dev/null | wc -l | tr -d ' ')
        DOESNT=$(grep -l '"status": "doesnt-work"' packages/test-harness/results/*.json 2>/dev/null | wc -l | tr -d ' ')
        NA=$(grep -l '"status": "not-applicable"' packages/test-harness/results/*.json 2>/dev/null | wc -l | tr -d ' ')
        ALT=$(grep -l '"status": "use-alternative"' packages/test-harness/results/*.json 2>/dev/null | wc -l | tr -d ' ')
        TOTAL=$((WORKS + DOESNT + NA + ALT))
        if [ $TOTAL -gt 0 ]; then
            PASS_PCT=$((100 * WORKS / TOTAL))
            NA_PCT=$((100 * NA / TOTAL))
            echo -e "${DIM}  Progress: $TOTAL packages | ${GREEN}$WORKS works${NC} ${DIM}($PASS_PCT%) | ${RED}$DOESNT failing${NC} ${DIM}| ${YELLOW}$NA n/a${NC} ${DIM}($NA_PCT%) | $ALT alt${NC}"
        fi
    elif [ -f "PROGRESS.md" ]; then
        PACKAGES=$(grep -oE "Total Packages Tested:\*\* [0-9]+" PROGRESS.md 2>/dev/null | grep -oE "[0-9]+" || echo "?")
        RATE=$(grep -oE "Pass Rate:\*\* [0-9]+%" PROGRESS.md 2>/dev/null | grep -oE "[0-9]+%" || echo "?")
        echo -e "${DIM}  Progress: $PACKAGES packages, $RATE pass rate${NC}"
    fi
    echo -e "${DIM}  Session: $COUNT iters | $SESSION_TOKENS tokens | \$$SESSION_COST${NC}"
    echo -e "${DIM}  All time: \$$CUMULATIVE_COST${NC}"
    echo ""
    
    if [ $EXIT_CODE -ne 0 ]; then
        if [ $EXIT_CODE -eq 124 ]; then
            SESSION_TIMEOUTS=$((SESSION_TIMEOUTS + 1))
            echo -e "${RED}⚠ Timed out ($SESSION_TIMEOUTS/$MAX_SESSION_TIMEOUTS consecutive) - retrying${NC}"
            if [ $SESSION_TIMEOUTS -ge $MAX_SESSION_TIMEOUTS ]; then
                echo -e "${RED}✗ Hit max consecutive timeouts ($MAX_SESSION_TIMEOUTS) - exiting${NC}"
                cleanup
            fi
        else
            echo -e "${RED}⚠ Error (exit $EXIT_CODE) - pausing 30s${NC}"
            sleep 30
        fi
    else
        # Reset timeout counter on successful iteration
        SESSION_TIMEOUTS=0
    fi
    
    echo -e "${DIM}Next iteration in 5s... (Ctrl+C to stop)${NC}"
    sleep 5
    echo ""
done
