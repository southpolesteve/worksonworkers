# Works on Workers - Setup Inputs

This documents all human inputs that went into setting up this project before Ralph Wiggum (autonomous loop) took over.

---

## Input 1: Initial Vision

> I want to do Ralph Wiggum style development on an idea using open code: https://ghuntley.com/ralph/
>
> Okay, here is the idea. I want to make a website that eventually would be open source that's called works on workers. So one of the things we get a lot of feedback that maybe certain things do or do not work on Cloudflare workers, NPM packages. And what I want to do is just go through like the top thousand NPM packages. and I want to come up with a database or a list or a repository that has examples for all of these packages. basically yes it works with a simple example again simplest possible thing you can get working on a worker or no it doesn't work or there's a better package out there that people should be Using instead, or maybe even say if it's like built into workers, or maybe you can suggest, or maybe it doesn't even make sense to run on workers. I'm sure there's packages that don't even make sense at all to run on workers. I would like to go through the top thousand, compile this into some list with examples, with details. and put it on a website that presents all of this information in some nice format that, especially with the latest node compatibility of workers, makes it clear that most NPM packages people want to use work on workers. And I want to do this using the latest Wrangler. and the latest version of Worder Workers with node compatibility turned on. And I want to Just churn through and figure out how to build this. And again, I want to use this like Ralph Wiggum style development. So just keep. You know, coming up with a plan and a PRD for this based on what I've told you, and then just iterating on it over and over again until we get something that we like.

---

## Input 2: Answers to Planning Questions

> 1. You figure it out. 
> 2. Im open to any ideas but locally seems like a good place to start or use https://developers.cloudflare.com/workers/runtime-apis/bindings/worker-loader/ which I have access to. 
> 3. Minimal but at least basic usage. It should do something not just import. 
> 4. Hosted on workers. Use Cloudflare tech to build this as much as possible. Static site is prob the simplest but try other idea if you have them. 
> 5. Yes script and automate as much as possible. 
> 6. Idk you figure htat out. 
> 7. Do that via github issues. If someone submits an issue figure out what pacakge they want to try and iterate on it in a github workflow and submit a PR.

---

## Input 3: Start Building

> Just keep going

---

## Input 4: Request for Ralph Wiggum Loop

> OK I feel like were not actually doing ralph wiggum yet. I want to run open code in a loop. I want to do it ralph wiggum style. Setup the command for me to do that. Also in each iteration I want to keep progress tracked and logged to a file so I can read it and the LLM can also read it and also keep track of tokens used and cost per iteration so over time I can see how much this entire thing is costing

---

## Input 5: Final Request

> Ill start the loop myself. Tell me the command. Can you also put all the inputs I have written so far in a md doc so its clear how much went into setting this up?

---

## Summary

**Total human inputs:** 5 messages

**Time spent by human:** ~5 minutes of typing

**What was built from these inputs:**
- Complete project structure with npm workspaces
- Automated test harness using Vitest + Wrangler
- Curated list of 200 top npm packages
- 50+ package-specific test configurations
- Website with search/filter (Cloudflare Workers)
- GitHub Actions for CI/CD
- GitHub Issue templates for community contributions
- Ralph Wiggum loop script with cost tracking
- Progress tracking system

**Current state when handoff to Ralph:**
- 50 packages tested
- 86% compatibility rate
- Website working locally
- Ready for autonomous iteration
