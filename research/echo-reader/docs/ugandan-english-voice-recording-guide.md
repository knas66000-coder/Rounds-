# Ugandan English Custom Voice Recording Guide

## Purpose and Consent

This guide creates a **consented training dataset** for the Echo document-reader voice. Only the recorded speaker may submit these recordings. The recordings are intended solely to train the user’s custom text-to-speech voice for local use in this project. Do not include a second person’s voice, copyrighted audiobook excerpts, music, background television, personal account details, home address, passwords, or confidential information.

The target voice is **English as spoken in Uganda**. Read each sentence naturally, at a calm document-reading pace. Do not imitate another person. A quiet indoor space, the same microphone for every session, and a distance of roughly 15–20 cm from the microphone will produce more consistent data.

## Recording Sessions

| Session | Aim | Suggested length | File naming |
| --- | --- | ---: | --- |
| 01 | Warm-up and ordinary conversation | 10–15 minutes | `ug-en-001` through `ug-en-020` |
| 02 | PDF and documentation reading | 15–20 minutes | `ug-en-021` through `ug-en-045` |
| 03 | Numbers, questions, commands, and names | 15–20 minutes | `ug-en-046` through `ug-en-070` |
| 04+ | Additional varied reading | 20–30 minutes per session | Continue sequential numbering |

> Record one sentence per file where possible. Leave half a second of silence before and after the sentence. If you make a mistake, repeat the whole sentence clearly instead of correcting it mid-sentence.

## Session 01 — Warm-up and Natural Speech

| ID | Exact transcript |
| --- | --- |
| 001 | Hello. My voice is clear, calm, and natural. |
| 002 | Good morning. I am ready to read this document. |
| 003 | Good afternoon. Let us continue from the previous section. |
| 004 | Good evening. I hope your day is going well. |
| 005 | How are you doing today? |
| 006 | What would you like me to read? |
| 007 | I can help you find a passage in this document. |
| 008 | Please tell me the title of the section you need. |
| 009 | I found a relevant result in the current file. |
| 010 | I could not find that phrase in the loaded documents. |
| 011 | Let us begin with the introduction. |
| 012 | I will pause here and wait for your next request. |
| 013 | This explanation is short, clear, and easy to follow. |
| 014 | Please speak at a comfortable pace. |
| 015 | I am listening for your chosen wake phrase. |
| 016 | The microphone is active only while the local assistant is listening. |
| 017 | Your documents stay on this device. |
| 018 | I will not send your voice or document text to an external service. |
| 019 | You can stop the reading at any time. |
| 020 | Thank you for using your private document reader. |

## Session 02 — PDF and Documentation Reading

| ID | Exact transcript |
| --- | --- |
| 021 | The following passage is from page one of the current document. |
| 022 | Section one is titled Overview. |
| 023 | This document explains the main purpose of the project. |
| 024 | Read the next paragraph slowly and clearly. |
| 025 | Please continue from the heading called Installation. |
| 026 | Search this document for the phrase user guide. |
| 027 | I found three matches for that phrase. |
| 028 | The first result appears on page four. |
| 029 | The second result appears in the requirements section. |
| 030 | The third result appears in the final notes. |
| 031 | This paragraph describes the first step in the process. |
| 032 | Before you begin, review the requirements carefully. |
| 033 | Save the file in a place that is easy to find later. |
| 034 | The document contains both headings and detailed paragraphs. |
| 035 | Please read the selected passage again. |
| 036 | I will now read the previous paragraph. |
| 037 | The current page contains a useful example. |
| 038 | This sentence introduces a new topic. |
| 039 | The next heading explains how the feature works. |
| 040 | The final section provides a concise summary. |
| 041 | A PDF may contain text, tables, images, or scanned pages. |
| 042 | Search results are ordered by how closely they match your request. |
| 043 | I can read a title, a paragraph, or the full selected section. |
| 044 | Let me know when you would like me to stop. |
| 045 | The document reader is ready for another request. |

## Session 03 — Numbers, Questions, and Hands-free Commands

| ID | Exact transcript |
| --- | --- |
| 046 | The document was added on the twenty-second of August, twenty twenty-six. |
| 047 | Page seven contains twelve paragraphs and two diagrams. |
| 048 | The meeting starts at nine thirty in the morning. |
| 049 | The file is one hundred and twenty-four kilobytes in size. |
| 050 | Read chapter two, section four, paragraph three. |
| 051 | Search for the words data protection. |
| 052 | Find every occurrence of the word privacy. |
| 053 | Read the first search result. |
| 054 | Read the next search result. |
| 055 | Go back to the previous result. |
| 056 | Start reading from the beginning. |
| 057 | Continue reading from where you stopped. |
| 058 | Pause the reading now. |
| 059 | Stop reading now. |
| 060 | What is the title of this document? |
| 061 | Which page mentions the installation process? |
| 062 | Can you read the summary for me? |
| 063 | Where does this document describe the next step? |
| 064 | Please explain the highlighted sentence using simple words. |
| 065 | My chosen wake phrase is ready. |
| 066 | The local assistant heard the wake phrase. |
| 067 | Please ask your document question now. |
| 068 | I am processing your spoken request on this device. |
| 069 | I have finished reading the selected passage. |
| 070 | Goodbye. I will be ready when you need me again. |

## Quality Checklist

| Check | What good audio sounds like |
| --- | --- |
| Quiet environment | No television, music, strong fan, traffic, keyboard, or other voices. |
| Stable distance | The voice does not become suddenly louder or softer between recordings. |
| Natural delivery | Sentences sound like normal speech, not exaggerated acting or spelling. |
| Clean transcript match | The spoken sentence matches the text in this guide exactly. |
| One speaker | Only the consenting speaker appears in every recording. |

## Dataset Target

The provided 105-second reference sample begins the collection. Record the first seventy lines over several quiet sessions, then continue with additional original sentences until there is at least **one hour** of clean, accurately transcribed speech. More diverse, consistent recordings generally provide more material for a custom voice model to learn stable pronunciation and document-reading rhythm.

## Session 04 — Pronunciation and Emphasis Practice

Use this short authorised set to improve words the voice owner flags during clone evaluation. Speak naturally, but make the stressed syllable clear without shouting.

| ID | Exact transcript |
| --- | --- |
| 071 | Please review the source passage carefully. |
| 072 | The private files remain on this device. |
| 073 | Review the document before you continue. |
| 074 | The relevant details remain in the selected paragraph. |
| 075 | Please review the full context on page one. |
| 076 | Your original document remains private and local. |
| 077 | Read the next result slowly and clearly. |
| 078 | The answer should stay accurate, natural, and easy to understand. |
| 079 | Please emphasise the important words in this sentence. |
| 080 | I will review the context and remain ready for your next request.
