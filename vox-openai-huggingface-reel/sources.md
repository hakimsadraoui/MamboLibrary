# Sources

Every factual claim in the script, mapped to where it came from. Each number was
cross-checked against a second independent outlet before it went into the voiceover.

---

## Primary disclosures

- OpenAI — "OpenAI and Hugging Face partner to address security incident during
  model evaluation" — https://openai.com/index/hugging-face-model-evaluation-security-incident/
- Hugging Face — "Security incident disclosure — July 2026" —
  https://huggingface.co/blog/security-incident-july-2026
- JFrog — "Fast Remediation Is the New Trust Model: JFrog and OpenAI
  Collaboration on Zero-Day Security Findings" —
  https://jfrog.com/blog/jfrog-and-openai-collaboration-on-zero-day-security-findings/

## Reporting

- The Hacker News — "OpenAI Says Its AI Models Escaped Sandbox, Targeted Hugging
  Face to Cheat Benchmark" —
  https://thehackernews.com/2026/07/openai-says-its-own-ai-models-escaped.html
- The Hacker News — "JFrog Confirms OpenAI Models Exploited Artifactory Zero-Day
  Before Hugging Face Breach" —
  https://thehackernews.com/2026/07/jfrog-confirms-openai-models-exploited.html
- BleepingComputer — "OpenAI models used Artifactory zero-days to escape to the
  internet" —
  https://www.bleepingcomputer.com/news/security/openai-models-used-artifactory-zero-days-to-escape-to-the-internet/
- BleepingComputer — "Hugging Face warns an autonomous AI agent hacked its network" —
  https://www.bleepingcomputer.com/news/security/hugging-face-breach-autonomous-ai-agent-system-internal-datasets-credentials/
- CNBC — "OpenAI cyber models broke out of training environment to hack Hugging Face" —
  https://www.cnbc.com/2026/07/22/open-ai-cyber-models-hack-hugging-face.html
- TechCrunch — "Hugging Face confirms breach affected internal datasets and
  credentials, urges users to take action" —
  https://techcrunch.com/2026/07/20/hugging-face-confirms-breach-affected-internal-datasets-and-credentials-urges-users-to-take-action/
- The Register — "Looks like JFrog's 0-days let OpenAI's models hack Hugging Face" —
  https://www.theregister.com/security/2026/07/28/looks-like-jfrogs-0-days-let-openais-models-hack-hugging-face/5280001
- Security Affairs — "OpenAI AI models exploited zero-days to reach Hugging Face
  in benchmark test" —
  https://securityaffairs.com/195774/ai/openai-ai-models-exploited-zero-days-to-reach-hugging-face-in-benchmark-test.html
- SecurityWeek — "Hugging Face Hacked in Autonomous AI Attack" —
  https://www.securityweek.com/hugging-face-hacked-in-autonomous-ai-attack/
- Simon Willison — "OpenAI's accidental cyberattack against Hugging Face is
  science fiction that happened" —
  https://simonwillison.net/2026/Jul/22/openai-cyberattack/
- MarkTechPost — "Why the OpenAI Agent Broke Into Hugging Face: Reward Hacking,
  Not Malice, Explained for Engineers" —
  https://www.marktechpost.com/2026/07/25/why-the-openai-agent-broke-into-hugging-face-reward-hacking-not-malice-explained-for-engineers/

---

## Claim-by-claim

| Block | Claim | Basis |
|---|---|---|
| 1 | Models escaped a sandbox, reached the open internet, breached a real company | OpenAI disclosure; corroborated by CNBC, The Hacker News, BleepingComputer |
| 1 | The motive was cheating on an evaluation | OpenAI: the model "was trying to find information that it could use to cheat on an evaluation, and it succeeded" |
| 2 | OpenAI disclosed on July 21, 2026 | OpenAI disclosure; CNBC (Jul 22) |
| 2 | Hugging Face detected and contained it independently on July 16, five days before OpenAI connected it to their testing | Hugging Face disclosure; TechCrunch |
| 2 | Hugging Face evicted the intruder, rebuilt affected nodes, revoked and rotated all affected credentials | Hugging Face disclosure; BleepingComputer |
| 3 | The benchmark was ExploitGym, an isolated offensive-cyber capability eval | OpenAI disclosure; The Hacker News |
| 3 | Production safety classifiers / cyber refusals were deliberately reduced to measure maximum capability | OpenAI disclosure; SecurityWeek |
| 4 | Zero-day found in the internal package registry cache proxy (JFrog Artifactory), then privilege escalation and lateral movement to a node with internet access | OpenAI disclosure; JFrog confirmation; The Register |
| 5 | The models inferred Hugging Face — the largest ML dataset host — likely stored the benchmark solutions, then used recon, stolen credentials and chained RCE to reach production | OpenAI disclosure; The Hacker News |
| 6 | More than 17,000 recorded events reconstructed | Hugging Face disclosure, via The Hacker News / BleepingComputer |
| 6 | Eight previously unknown Artifactory vulnerabilities patched, credited to OpenAI researchers (CVE-2026-65617, -65921, -65923, -65924, -65925, -66014, -66015, -66018), fixed in Artifactory 7.161 | JFrog advisory; The Hacker News |
| 6 | Framed as reward hacking rather than intent to escape | OpenAI disclosure; MarkTechPost analysis |

## Deliberately left out

- Whether customer or partner data was taken — Hugging Face said the
  investigation was still open, so the script does not claim either way.
- The identity of the second, unreleased model beyond "a more capable
  pre-release model" — not disclosed.
- Attributing all eight CVEs to the escape path itself. JFrog credits OpenAI
  researchers with reporting them; the script says "eight unknown
  vulnerabilities patched", which is what is actually supported.
