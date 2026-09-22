#!/usr/bin/env python3
from __future__ import annotations

import argparse
import html
import json
import math
import os
import random
import re
import struct
import subprocess
import tempfile
import wave
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
AUDIO_DIR = ROOT / "assets" / "audio"
TRANSCRIPT_DIR = ROOT / "assets" / "transcripts"
MASTER_DIR = AUDIO_DIR / "master-tracks"
HUMAN_RECORDING_DIR = AUDIO_DIR / "human-recordings"
RECORDING_PACKET_DIR = ROOT / "docs" / "podcast-recording-packets"
PROFESSIONAL_VOICE_CONFIG = ROOT / "tools" / "professional_voice_config.json"
PROFESSIONAL_VOICE_EXAMPLE = ROOT / "tools" / "professional_voice_config.example.json"
OPENAI_SPEECH_URL = "https://api.openai.com/v1/audio/speech"
ELEVENLABS_SPEECH_URL = "https://api.elevenlabs.io/v1/text-to-speech"
INTRO_WAV = AUDIO_DIR / "the-turning-life-geometric-intro.wav"
INTRO_MP3 = AUDIO_DIR / "the-turning-life-geometric-intro.mp3"
LOUDNORM = Path("/root/.codex/skills/modify-audio-cli/scripts/two_pass_loudnorm.py")
BASE_URL = "https://tsrnc2.github.io/project-infinity/"
LAST_BUILD = "Sun, 12 Jul 2026 00:00:00 +0000"
CLOSING = "This has been The Turning Life. Until next time, witness honestly, choose freely, serve gently, and begin again."
PARK_CUE = "[Sound: occasional soft park ambience with low air, distant leaves, and light bird calls under the conversation.]"
OFFICE_CUE = "[Sound: muffled soft background music, low office-room noise, and occasional quiet human reactions under the conversation.]"
SOUND_DESIGN_NOTE = "randomized subtle tone and pitch variation, occasional muffled grunts, coughs, sneezes, and quiet laughter, soft background music, office-room noise, soft park ambience, and original transition music cues"
SOUNDTRACK_NOTE = "Original free-use transition soundtrack: procedurally generated for this site with no third-party samples."
SECTION_STRUCTURE = "Opening; Personal life check-in; Teaching; Emotional turn; Daily practice; Closing statement."

VOICES = {
    "Father Rowan": ("en-GB-ThomasNeural", "-16%", "-4Hz"),
    "Maya Vale": ("en-US-JennyNeural", "+0%", "+0Hz"),
    "Amara Keene": ("en-AU-NatashaNeural", "-2%", "-1Hz"),
}


DEFAULT_PROFESSIONAL_VOICE_CONFIG: dict[str, Any] = {
    "provider": "openai",
    "openai": {
        "model": "gpt-4o-mini-tts",
        "response_format": "wav",
        "voices": {
            "Father Rowan": {
                "voice": "onyx",
                "instructions": "Older male religious guide. Slow, warm, composed, lightly British-Boston in cadence, intimate podcast table tone, never theatrical.",
            },
            "Maya Vale": {
                "voice": "nova",
                "instructions": "Adult West Coast woman in her 20s. Warm, direct, vulnerable but steady, natural podcast delivery with small hesitations, not melodramatic.",
            },
            "Amara Keene": {
                "voice": "coral",
                "instructions": "Adult West Coast woman in her 20s. Grounded, protective, emotionally clear, relaxed natural conversation, not announcer-like.",
            },
        },
    },
    "elevenlabs": {
        "model_id": "eleven_multilingual_v2",
        "output_format": "mp3_44100_128",
        "voice_settings": {
            "stability": 0.42,
            "similarity_boost": 0.78,
            "style": 0.28,
            "use_speaker_boost": True,
        },
        "voices": {
            "Father Rowan": {"voice_id": "REPLACE_WITH_FATHER_ROWAN_VOICE_ID"},
            "Maya Vale": {"voice_id": "REPLACE_WITH_MAYA_VALE_VOICE_ID"},
            "Amara Keene": {"voice_id": "REPLACE_WITH_AMARA_KEENE_VOICE_ID"},
        },
    },
}

TRANSITION_LABELS = {
    "witness": "witness bridge",
    "heart": "heart turn",
    "practice": "practice turn",
    "recovery": "recovery breath",
}

TRANSITIONS = {
    key: AUDIO_DIR / f"the-turning-life-transition-{key}.wav" for key in TRANSITION_LABELS
}


@dataclass(frozen=True)
class Section:
    name: str
    transition: str | None
    lines: tuple[tuple[str, str], ...]


@dataclass(frozen=True)
class Episode:
    number: int
    slug: str
    title: str
    date: str
    description: str
    emotional_note: str
    sections: tuple[Section, ...]
    content_note: str | None = None
    train: bool = False


EPISODES: tuple[Episode, ...] = (
    Episode(
        1,
        "podcast-episode-01-begin-where-you-are",
        "Begin Where You Are",
        "July 10, 2026",
        "Maya and Amara ask Father Rowan how honesty can strengthen a relationship without becoming cruelty.",
        "Integrated emotional moment: Maya names the fear of being fully known, and Amara answers with steady tenderness.",
        (
            Section("Opening", None, (
                ("Father Rowan", "Welcome to The Turning Life. I am Father Rowan, priest of the Religion of Transformation."),
                ("Maya Vale", "I am Maya Vale, and, um, I am here with my partner and cohost, Amara Keene."),
                ("Amara Keene", "Hello. Maya and I wanted this show to feel, you know, like a table conversation, not a sermon thrown from a balcony."),
                ("Father Rowan", "Then let the table be blessed. Questions are welcome here."),
            )),
            Section("Personal Life Check-In", "witness", (
                ("Maya Vale", "At home this week, I, I caught myself rehearsing perfect answers after a small argument about laundry."),
                ("Amara Keene", "And I noticed I wanted to disappear into my phone instead of saying I was tired and embarrassed."),
                ("Maya Vale", "The religion helped because witness gave us a word for the moment. Not a verdict, just a light."),
                ("Father Rowan", "That is a good use of religion. It does not make either of you superior. It helps you stand in the room honestly."),
            )),
            Section("Teaching", "witness", (
                ("Maya Vale", "Our first question is simple and, I guess, hard. In a relationship, where do we begin when both people are imperfect?"),
                ("Father Rowan", "Begin where you are, not where you wish the other person believed you were. Love cannot grow inside a performance for very long."),
                ("Amara Keene", "But honesty can sound like an attack. If I say, this hurt me, Maya can feel accused. If she says, I am afraid, I can, I can feel blamed."),
                ("Father Rowan", "That is why witness has two hands. One hand holds truth. The other holds tenderness. Truth without tenderness becomes a weapon. Tenderness without truth becomes a mask."),
                ("Maya Vale", "So the goal is not to win the conversation."),
                ("Father Rowan", "Correct. The goal is to make reality safe enough to examine. If you are partners, you are not enemies cross-examining each other. You are witnesses trying to find the real room you are standing in."),
                ("Amara Keene", "What does that sound like in ordinary words?"),
                ("Father Rowan", "It sounds like this. I am hurt, and I want repair, not victory. I am afraid, and I want closeness, not control. I made a mistake, and I want to understand the harm before I defend myself."),
            )),
            Section("Emotional Turn", "heart", (
                ("Maya Vale", "Can I say the quiet part? Sometimes, um, I am afraid that if I am fully known, I will become too much to love."),
                ("Amara Keene", "I know that fear. I, I really do. But I do not need you polished before you come close. I need you real enough that I can find you."),
                ("Father Rowan", "Then let this be the tenderness under the truth. You are not confessing so you can be punished. You are opening a door where love can enter honestly."),
                ("Maya Vale", "That makes the first step feel smaller. Still scary, but, but smaller. It admits need without demanding obedience."),
                ("Father Rowan", "Need is not the same as ownership. You may ask for care. You may not claim another soul as property because you are afraid."),
                ("Amara Keene", "What if one partner changes faster than the other?"),
                ("Father Rowan", "Then patience and boundaries must sit together. Do not punish growth because it makes you uncomfortable. Also, do not demand that someone accept harmful behavior in the name of patience."),
                ("Maya Vale", "So we can say, I love you, and this pattern still has to change."),
                ("Father Rowan", "Yes. A sacred relationship is not one without conflict. It is one where conflict is brought into witness, consent, and repair."),
            )),
            Section("Daily Practice", "practice", (
                ("Amara Keene", "Give us one practice for tonight."),
                ("Father Rowan", "Each of you writes three lines. One truth I can admit. One fear beneath my reaction. One repair I can begin without forcing my partner to move first."),
                ("Maya Vale", "I can do that. It gives each of us responsibility."),
                ("Father Rowan", "Small enough to take is sacred enough to begin."),
            )),
            Section("Closing Statement", None, (("Father Rowan", CLOSING),)),
        ),
    ),
    Episode(
        2,
        "podcast-episode-02-the-four-practices",
        "The Four Practices in Love",
        "July 10, 2026",
        "Father Rowan teaches Maya and Amara how witness, refinement, creation, and service can guide a committed adult relationship.",
        "Integrated emotional moment: the hosts admit the exhaustion and self-doubt that can hide underneath discipline.",
        (
            Section("Opening", None, (
                ("Maya Vale", "Father Rowan, last episode we, we began with witness. Today we want to ask about the four practices."),
                ("Amara Keene", "Witness, refine, create, and serve. They sound clean on a page. Relationships are, well, messier."),
                ("Father Rowan", "Good. A teaching that cannot survive a kitchen table is, I think, not ready for a temple."),
            )),
            Section("Personal Life Check-In", "witness", (
                ("Amara Keene", "Our personal check-in is not dramatic. It was dishes, rent, and both of us being a little short."),
                ("Maya Vale", "I wanted to prove I was doing enough. Amara wanted quiet. The four practices gave us a way to slow down."),
                ("Amara Keene", "Witness helped me say I was tired, not unloved. Refinement helped me name when I would come back."),
                ("Father Rowan", "Then the religion helped by becoming a practical rhythm. It did not solve the dishes by magic. It made honest cooperation easier."),
            )),
            Section("Teaching", "witness", (
                ("Maya Vale", "Then take us to the kitchen table."),
                ("Father Rowan", "Witness says, see what is real. In love, that means noticing the actual pattern, not the romantic story you prefer."),
                ("Amara Keene", "For us, that might be how we handle stress. I get quiet. Maya asks more questions. Then, you know, I feel crowded and she feels shut out."),
                ("Father Rowan", "That is a clean witness. No villain has been named. A pattern has been named."),
                ("Maya Vale", "What is refinement then?"),
                ("Father Rowan", "Refinement chooses one pattern and trains a better response. Not every wound at once. One practice repeated until the household can feel it."),
                ("Amara Keene", "So instead of promising, I will never shut down again, I might say, when I need silence, I will name a return time."),
                ("Father Rowan", "Excellent. That is refinement with consent. It protects your need for quiet and Maya need for connection."),
                ("Maya Vale", "And I might refine my questions by asking, do you want comfort, space, or problem solving?"),
                ("Father Rowan", "That is love becoming skill."),
            )),
            Section("Emotional Turn", "heart", (
                ("Amara Keene", "Sometimes I hear practice and, um, I get tired before we even start. I think, what if I am always someone who needs fixing?"),
                ("Maya Vale", "And I worry I will turn love into a checklist. I mean, like if I perform the practices well enough, I will finally be safe."),
                ("Father Rowan", "Then hear me clearly. The four practices are not proof that you are defective. They are a way to hold your life gently enough to change it."),
                ("Amara Keene", "So refinement is not self-contempt."),
                ("Father Rowan", "Never. Refinement without mercy is only another wound wearing religious clothes."),
            )),
            Section("Daily Practice", "practice", (
                ("Amara Keene", "What about creation? We are not always making art."),
                ("Father Rowan", "Creation means making inner change visible. A shared calendar. A repaired room. A meal after a hard talk. A note that says, I heard you. A budget written honestly."),
                ("Maya Vale", "Something the relationship can, can stand on."),
                ("Father Rowan", "Yes. Feeling sorry is not yet repair. Feeling grateful is not yet devotion. Creation gives the change a body."),
                ("Amara Keene", "And service?"),
                ("Father Rowan", "Service asks whether your love reduces suffering beyond the two of you. A couple can become a closed shrine to itself. That is not holiness."),
                ("Maya Vale", "So partners should not disappear into each other."),
                ("Father Rowan", "No. Keep friends, elders, doctors, counselors, family where safe, and the wider work of the world. Isolation weakens love."),
                ("Amara Keene", "That matters. Romance can, if we are not careful, become an excuse to make one person your whole universe."),
                ("Father Rowan", "A person is not built to be a universe. A partner is a beloved neighbor with sacred freedom."),
                ("Maya Vale", "Give us the four-practice exercise."),
                ("Father Rowan", "At the end of the day, each partner says one witness, one refinement, one thing made visible, and one act of service. Keep it brief. Keep it concrete. Keep it free of punishment."),
                ("Amara Keene", "Witness, refine, create, serve. Love as a practice, not just a feeling."),
                ("Father Rowan", "Exactly. Feelings are weather. Practice is the path you can walk in weather."),
            )),
            Section("Closing Statement", None, (("Father Rowan", CLOSING),)),
        ),
    ),
    Episode(
        3,
        "podcast-episode-03-how-to-read-a-sacred-day",
        "Reading a Sacred Day Together",
        "July 10, 2026",
        "Maya and Amara ask how a couple can use the calendar as a shared practice without letting symbols control the relationship.",
        "Integrated emotional moment: Maya admits using symbols to avoid vulnerability, and Amara asks to be seen at the breakfast table.",
        (
            Section("Opening", None, (
                ("Amara Keene", "Today we want to ask about the calendar. Maya loves symbols. I am, I will admit, more cautious."),
                ("Maya Vale", "That is fair. I can, I can turn a sign into a whole weather report for my soul."),
                ("Father Rowan", "Then both of you bring wisdom. Symbols need imagination, and imagination needs boundaries."),
            )),
            Section("Personal Life Check-In", "witness", (
                ("Maya Vale", "Our life this week had one very ordinary sacred day. We were late, the toast burned, and I still wanted to do a perfect reading."),
                ("Amara Keene", "The religion helped when we let the calendar point us back to the table instead of away from it."),
                ("Maya Vale", "I had to laugh because the holy act was not decoding everything. It was apologizing and making more breakfast."),
                ("Father Rowan", "That is a mature reading. A sign has served you when it returns you to love, responsibility, and the next real action."),
            )),
            Section("Teaching", "witness", (
                ("Amara Keene", "How can partners read a sacred day together without one person using it to steer the other?"),
                ("Father Rowan", "First, remember that a symbol is an invitation, not an order. The calendar gives language for attention. It does not grant authority over another person."),
                ("Maya Vale", "So I should not say, um, the moon gate says you need to apologize."),
                ("Father Rowan", "No. You may say, the moon gate makes me want to examine repair today. Would you be willing to talk? Consent remains the doorway."),
                ("Amara Keene", "That changes the whole tone."),
                ("Father Rowan", "Because sacred language can become manipulation if it is used to trap someone. A priest, partner, or teacher must never hide control inside holy words."),
            )),
            Section("Emotional Turn", "heart", (
                ("Maya Vale", "I need to admit something. Sometimes I reach for symbols because the plain moment feels, honestly, too vulnerable."),
                ("Amara Keene", "I can feel that. Some mornings I do not need a perfect reading. I need breakfast with you. I need you to, to look up from the meaning and see me."),
                ("Father Rowan", "That is a holy correction. A symbol that keeps you from the person in front of you has stopped serving truth."),
                ("Maya Vale", "Then maybe the reading is not finished until I come back to the table."),
                ("Father Rowan", "Yes. Sacred time must return you to living time."),
            )),
            Section("Daily Practice", "practice", (
                ("Maya Vale", "Walk us through a reading for a couple."),
                ("Father Rowan", "Begin with the daily seal. Ask, what small mark does this day leave on my conduct? Then read the weekly virtue. Ask, what ordinary discipline does this weekday request?"),
                ("Amara Keene", "Then the monthly seal?"),
                ("Father Rowan", "Yes. The month gives a wider theme. The year sign gives the public weather around the practice. After that, read the house, tone, sign, and moon gate."),
                ("Maya Vale", "That is a lot. How do we keep it from becoming, you know, vague?"),
                ("Father Rowan", "Choose one sentence and one action. If the reading cannot become an action, it is not finished."),
                ("Amara Keene", "Give us an example."),
                ("Father Rowan", "If the day points toward mirror and the weekly virtue is council, one partner might say, my action is to review our shared plans without defensiveness. The other might say, my action is to ask for what I need without guessing your guilt."),
                ("Maya Vale", "Separate actions, chosen freely."),
                ("Father Rowan", "Exactly. Shared reading, separate consent. The relationship is strengthened when each soul drinks for itself."),
                ("Amara Keene", "What if we disagree about the meaning of the day?"),
                ("Father Rowan", "Then record both readings. Difference is not failure. The point is not to force one interpretation. The point is to become more attentive and more responsible."),
                ("Maya Vale", "So at sunset we ask, what did my reading produce?"),
                ("Father Rowan", "Yes. Not, did I sound spiritual? Ask, did I tell the truth, repair harm, respect freedom, and do one useful thing?"),
                ("Amara Keene", "That makes the calendar feel safer."),
                ("Father Rowan", "Good. A sacred calendar should return you to life, not remove you from it."),
            )),
            Section("Closing Statement", None, (("Father Rowan", CLOSING),)),
        ),
    ),
    Episode(
        4,
        "podcast-episode-04-service-completes-the-cycle",
        "Service Completes the Cycle",
        "July 10, 2026",
        "The cohosts ask Father Rowan how partners can help each other through difficulty without turning care into control.",
        "Integrated emotional moment: both hosts name the fear under helping and receiving help before the service practice continues.",
        (
            Section("Opening", None, (
                ("Maya Vale", "Father Rowan, our last episode, well, in this first set, is about service. In a relationship, service can be beautiful, but it can also get tangled."),
                ("Amara Keene", "Especially when one partner is struggling. You want to help, and, and help can become pressure."),
                ("Father Rowan", "Then begin with this vow. I may serve you, but I may not own you."),
            )),
            Section("Personal Life Check-In", "witness", (
                ("Amara Keene", "Our personal life example is a ride I did not ask for. Maya meant kindness, but I felt managed."),
                ("Maya Vale", "I thought I was being supportive. The service practice helped me stop and ask what help was actually wanted."),
                ("Amara Keene", "And it helped me receive care without turning every kindness into a debt I had to repay."),
                ("Father Rowan", "That is religion doing humble work. It protects freedom while making cooperation possible."),
            )),
            Section("Teaching", "witness", (
                ("Maya Vale", "That sounds simple. It is not simple when you are, when you are scared."),
                ("Father Rowan", "Fear often disguises control as care. It says, because I love you, I must manage you. But love without consent becomes a cage, even when the cage is built from worry."),
                ("Amara Keene", "What does service look like between partners?"),
                ("Father Rowan", "It looks like asking before assuming. Do you want advice, company, food, quiet, a ride, or help finding outside support? The question protects both people."),
                ("Maya Vale", "And if the issue is serious, like addiction, depression, or danger?"),
                ("Father Rowan", "Then service includes humility. A partner is not a hospital, not a crisis line, not a treatment team, and not a prison guard. Love can help someone reach qualified care. Love should not pretend to replace it."),
            )),
            Section("Emotional Turn", "heart", (
                ("Amara Keene", "There is a part of me that still flinches when someone helps. I, I wonder what I will owe them later."),
                ("Maya Vale", "And there is a part of me that helps too fast because, honestly, I cannot stand feeling helpless."),
                ("Father Rowan", "Thank you both. That is where service becomes honest. One fear says, care will own me. Another fear says, if I cannot fix you, I have failed you."),
                ("Amara Keene", "So we name the fear before it, before it writes the rules."),
                ("Father Rowan", "Yes. Service is cleanest when it is offered freely, received freely, and released freely."),
            )),
            Section("Daily Practice", "practice", (
                ("Amara Keene", "That matters for recovery. Support can be rides to meetings, a meal, sitting nearby, carrying naloxone where appropriate, or helping call a professional."),
                ("Father Rowan", "Yes. And if there is overdose risk, withdrawal danger, self harm, violence, or medical emergency, seek emergency support immediately. Spiritual care should make practical care easier to reach."),
                ("Maya Vale", "What about everyday service, when, you know, nobody is in crisis?"),
                ("Father Rowan", "Then serve in ways that make freedom stronger. Do a chore without making it a debt. Listen without collecting secrets as weapons. Encourage rest without mocking weakness. Celebrate growth without demanding that it happen on your schedule."),
                ("Amara Keene", "How do partners receive service well?"),
                ("Father Rowan", "With gratitude and honesty. Say thank you. Say what helps. Say what does not. Do not use your pain to command the other person, and do not reject every kindness to prove independence."),
                ("Maya Vale", "So service is cooperation."),
                ("Father Rowan", "Yes. Consent is the basis of cooperation, and cooperation is the basis of society. In a home, in a circle, in a nation, consent must be held sacred."),
                ("Amara Keene", "Give us one final practice."),
                ("Father Rowan", "Ask three questions tonight. What help did I request? What help did I assume? What repair is due because I crossed a boundary or withheld care?"),
                ("Maya Vale", "That is direct."),
                ("Father Rowan", "Love becomes holy when it becomes honest, useful, and free. Serve without ownership. Receive without surrendering your soul. Begin again tomorrow."),
            )),
            Section("Closing Statement", None, (("Father Rowan", CLOSING),)),
        ),
    ),
    Episode(
        5,
        "podcast-episode-05-when-recovery-begins",
        "When Recovery Begins",
        "July 10, 2026",
        "Maya and Amara speak with Father Rowan about early sobriety, family abuse, alcohol and other substance use, compulsive sexual behavior, fentanyl recovery, and the support that keeps recovery grounded.",
        "Integrated emotional moment: Maya names two weeks sober after family abuse, addiction, partner harm, and dangerous coercive circles; Father Rowan keeps the witness recovery-safe and points back to trained support.",
        (
            Section("Opening", None, (
                ("Maya Vale", "Welcome to The Turning Life. I am Maya Vale."),
                ("Amara Keene", "And I am Amara Keene. Today is, um, a more personal table than usual."),
                ("Father Rowan", "I am Father Rowan. Before we begin, a word of care. We will speak about family abuse, alcohol and other substance use, fentanyl addiction, and compulsive sexual behavior without graphic details. If this is active in your life, do not carry it alone. Seek trained medical, therapeutic, recovery, or emergency support."),
            )),
            Section("Personal Life Check-In", "recovery", (
                ("Maya Vale", "I need to place something on the table carefully. I am two weeks sober today, and that is a fragile beginning, not a trophy."),
                ("Amara Keene", "We talked before recording about what should stay private. The point is witness, not shock."),
                ("Maya Vale", "My story started in family abuse and in adults choosing silence when I needed protection. Alcohol came early. Later I used attention, relationships, and substances to avoid feeling what I could not say."),
                ("Father Rowan", "Then we will speak with care. Trauma may explain the shape of a wound, but it does not erase the need for safety, trained support, and repair where harm has been done."),
                ("Maya Vale", "The religion helped this week by keeping me honest about one day. A meal. A call. A meeting. A clean bed. Not a new identity. Just the next sober hour."),
                ("Amara Keene", "For me, the practice still helps me make the call before I feel ready. A doctor, a recovery contact, someone safe enough to tell the truth to."),
                ("Father Rowan", "That is the right order. Spiritual practice can support recovery, but trained care, practical safety, and honest community must remain within reach."),
            )),
            Section("Teaching", "witness", (
                ("Maya Vale", "Father, people hear the word recovery and, you know, sometimes imagine one shining moment. Like a door opens, the old life ends, and the new life walks in clean."),
                ("Father Rowan", "And that is rarely the truth. There may be a moment of surrender, but recovery is usually many doors. Some are opened by pain. Some by love. Some by a professional who knows what they are doing. Some by the quiet decision not to lie for one more hour."),
                ("Amara Keene", "My beginning was not noble. I, I wish I could say I woke up with wisdom. What happened was simpler. I got tired of arranging my entire life around fentanyl. I was tired of measuring every promise by whether it got in the way of using. I was tired of being afraid of my own body."),
                ("Maya Vale", "I remember you saying once that the first truth was not, I am strong. It was, I am in danger."),
                ("Amara Keene", "Yes. That sentence saved me because it was plain. Not dramatic. Not holy. Just, just true. I was in danger, and I needed help that was bigger than my pride. Medical help. Recovery people. Boundaries. People who would not hate me, but also would not help me disappear."),
                ("Father Rowan", "That is a sacred sentence when it is honest. I am in danger. It is not weakness. It is witness. The person who can name danger has already stepped outside the spell that says, nothing is wrong."),
                ("Maya Vale", "Mine sounded different, but it had the same root. I call it sex addiction when I am speaking personally, though I know careful language is compulsive sexual behavior. For me it was not about desire being evil. It was about using attention, fantasy, and secrecy to escape being known."),
                ("Amara Keene", "Can you say what started your recovery without saying more than you want to say?"),
                ("Maya Vale", "Yes. I hurt someone I loved by hiding. I lied, disappeared, and turned care into something I could use. I also used people for money, shelter, and escape when I did not know how to live honestly."),
                ("Amara Keene", "That is hard to say out loud."),
                ("Maya Vale", "It is. And I do not want trauma to become an excuse. I cheated. I broke consent by hiding the truth. Later, alcohol and other drugs joined the pattern, and dangerous people around me threatened someone I loved. When that relationship finally ended, I collapsed deeper into the old behavior."),
                ("Father Rowan", "And what did you need at the beginning?"),
                ("Maya Vale", "I needed to stop pretending that insight was the same as change. I could explain myself beautifully and still repeat the pattern. I tried to quit before and could not hold it. This time, two weeks sober means I am telling the truth sooner."),
                ("Father Rowan", "That is another sacred sentence. I cannot heal what I continue to protect. And for anyone listening, a dangerous person threatening you or someone you love is not a private spiritual puzzle. It is a safety issue. Bring in trained, local help."),
            )),
            Section("Emotional Turn", "heart", (
                ("Amara Keene", "The hard part for us as partners is that love can feel scared and still need boundaries. I can care about Maya and still not pretend that care fixes everything."),
                ("Maya Vale", "And I have to let care be care, not a loophole. If I am two weeks sober, I do not get to demand trust like it is already two years."),
                ("Father Rowan", "Love may ask for truth. Love may set boundaries. Love may refuse to participate in destruction. But love cannot become a private prison and still call itself healing."),
                ("Amara Keene", "So what is the difference between helping and controlling when addiction is involved?"),
                ("Father Rowan", "Helping begins with consent, clarity, and humility. It asks, what support have you asked for, what support am I able to give, and what belongs to trained care? Controlling begins with panic and ownership. It says, if I can manage your choices, then I will not have to feel afraid."),
                ("Maya Vale", "That sentence hurts because, well, it is true. I was controlled, and then I learned how to control. Recovery means I have to break both directions of that pattern."),
                ("Father Rowan", "Truth often hurts at first because it removes the costume. Then it helps because the real person can finally breathe."),
                ("Amara Keene", "There are still mornings when I miss the old silence. Not the danger. Not the damage. Just, um, the way it made everything stop for a while."),
                ("Maya Vale", "I understand that. There are still moments when secrecy feels easier than being seen. Then I, I remember what it cost us."),
                ("Father Rowan", "This is why recovery needs companionship and trained care. Not because you are failing, but because memory can be persuasive when pain is loud."),
            )),
            Section("Daily Practice", "practice", (
                ("Amara Keene", "My first real practice was making calls I did not want to make. A doctor. A recovery contact. Someone safe enough to tell the truth to. The miracle was not that I wanted to do it. The miracle was that I did it while I did not want to."),
                ("Maya Vale", "Mine is confession without performance. Not a dramatic speech. Just a clean sentence. This is what happened. This is the boundary I accept. This is the help I am seeking. This is the next honest action."),
                ("Father Rowan", "There is wisdom there for anyone listening. Recovery begins when truth becomes more valuable than image. It continues when support becomes more valuable than pride. It matures when service becomes more valuable than self-punishment."),
                ("Amara Keene", "I also want to say this. Recovery did not make me pure. It made me responsible. I still need support. I still need structure. I still need people who know the whole story."),
                ("Maya Vale", "And recovery did not make me ashamed of love or desire. It taught me that desire needs truth, consent, and boundaries if it is going to belong inside love. Two weeks sober is small, but it is real."),
                ("Father Rowan", "Then let us close with a practice. Tonight, write three sentences. First, the danger I am willing to name is this. Second, the support I will seek is this. Third, the honest action I can take before sleep is this. If the danger is urgent, do not wait for a perfect spiritual mood. Seek immediate help from trained people near you."),
                ("Amara Keene", "What helps me is hearing, I do not have to win the whole future today. I just, I have to stay honest now."),
                ("Maya Vale", "Just the next honest hour."),
                ("Father Rowan", "Yes. The next honest hour can become a doorway. Walk through it together, and call for help when the doorway is heavy."),
            )),
            Section("Closing Statement", None, (("Father Rowan", CLOSING),)),
        ),
        "This episode discusses family abuse, alcohol and other substance use, fentanyl addiction, compulsive sexual behavior, coercive relationship harm, and early sobriety without graphic detail. It is not medical, therapeutic, or emergency advice. If you are in active danger, seek trained local emergency, medical, or recovery support.",
        True,
    ),
    Episode(
        6,
        "podcast-episode-06-after-the-relapse",
        "After the Relapse",
        "July 12, 2026",
        "Maya and Amara speak with Father Rowan about relapse, the ordinary pressures that opened the door, what ended the spiral, and how repair begins without shame.",
        "Integrated emotional moment: Amara names the grief of calling Maya after a relapse, Maya admits how fear can become control, and Father Rowan turns both toward truth, boundaries, and trained support.",
        (
            Section("Opening", None, (
                ("Maya Vale", "Welcome to The Turning Life. I am Maya Vale."),
                ("Amara Keene", "And I am Amara Keene. Today we are talking about relapse. Not as a scandal. As something that has to be brought into the light quickly."),
                ("Father Rowan", "I am Father Rowan. We will speak without graphic detail. Relapse can involve medical danger, overdose risk, unsafe behavior, and deep shame. If you or someone near you is in immediate danger, seek emergency help and trained local support."),
            )),
            Section("Personal Life Check-In", "recovery", (
                ("Maya Vale", "Our check-in this week is not polished. The dishes were still in the sink, rent was tight, and both of us were pretending we were less tired than we were."),
                ("Amara Keene", "I had missed two support calls. Not because I had a grand reason. I was embarrassed, then busy, then ashamed that I was embarrassed. That is how the door opened."),
                ("Maya Vale", "My old door was secrecy. A message from family hit a wound I thought I had outgrown, and I started wanting the old kind of attention that made me disappear from myself."),
                ("Father Rowan", "So the first lesson is ordinary. Relapse often begins before the substance, before the old behavior, before the dramatic moment. It begins when hunger, anger, loneliness, tiredness, money fear, and secrecy go unspoken."),
                ("Amara Keene", "The religion helped only when it made me tell the truth. It did not cure the craving. It interrupted the lie that I was fine."),
            )),
            Section("Teaching", "witness", (
                ("Maya Vale", "People ask, what caused the relapse? But sometimes that sounds like one clean cause."),
                ("Father Rowan", "Yes. Relapse is usually a chain, not a lightning strike. One link may be exhaustion. Another may be resentment. Another may be skipping support. Another may be carrying shame alone. The final act gets attention, but the earlier links need witness."),
                ("Amara Keene", "For me the chain was a work shift that ran long, a paycheck that made me feel powerful and scared, and then a fight at home where I decided I was a burden."),
                ("Maya Vale", "I heard the fight as rejection. Then I wanted to monitor you. Ask where you were, who you talked to, what you felt. That is my fear trying to become a guard."),
                ("Father Rowan", "Fear may ask for safety, but it may not seize ownership. In recovery, the question is not, how do I control the person? The question is, what honest support, boundary, and trained care belong here?"),
                ("Amara Keene", "The relapse did not end because I became suddenly brave. It ended because I said one ugly true sentence. I used again, and I need help now."),
                ("Father Rowan", "That sentence matters. It ends the private kingdom where relapse grows. It does not erase consequences. It opens the door to safety."),
                ("Maya Vale", "Mine ended when I did not delete the evidence of my secrecy. I showed Amara the message. I said, this is where my mind went, and I need a boundary before I make it worse."),
                ("Father Rowan", "That is witness before collapse. For compulsive behavior, the end of relapse is not a dramatic confession for applause. It is truth, boundary, support, and repair."),
            )),
            Section("Emotional Turn", "heart", (
                ("Amara Keene", "I was scared to call Maya. I thought, if I tell her, she will look at me like I am the old story again."),
                ("Maya Vale", "I was scared too. I wanted to cry and punish and save you all at once. I had to sit on my hands and remember you are a person, not my emergency to own."),
                ("Amara Keene", "When you said, I am here, and we are calling someone trained, I broke. Not because it was easy. Because it was not just us alone in the room anymore."),
                ("Father Rowan", "That is a holy end to secrecy. Not a happy ending in the childish sense. A truthful ending. The spiral ended when witness became stronger than shame and when love made room for help beyond itself."),
                ("Maya Vale", "I also had to accept a boundary. Comfort did not mean acting like nothing happened."),
                ("Amara Keene", "And accountability did not mean I had to hate myself enough to prove I was sorry."),
                ("Father Rowan", "Exactly. Shame says, become smaller and hide. Accountability says, become truthful and repair."),
            )),
            Section("Daily Practice", "practice", (
                ("Maya Vale", "Can you give us the practice for after a relapse, or after almost relapsing?"),
                ("Father Rowan", "Use five sentences. First, what happened without decoration. Second, what chain led there. Third, who needs to know for safety. Fourth, what boundary starts now. Fifth, what repair is mine to begin."),
                ("Amara Keene", "And if the relapse includes overdose risk, withdrawal danger, self harm, violence, or medical danger, it is not a private spiritual exercise."),
                ("Father Rowan", "Correct. Seek emergency, medical, therapeutic, or recovery support immediately. Spiritual practice should make trained help easier to reach, not replace it."),
                ("Maya Vale", "For partners, maybe the practice is, I can love you and still need help holding the boundary."),
                ("Amara Keene", "And for the person who relapsed, I can be honest before I feel worthy of honesty."),
                ("Father Rowan", "Yes. Relapse is not the end of transformation. It is also not nothing. Bring it into witness quickly. Protect life. Repair harm. Return to support. Begin again without pretending the fall did not happen."),
            )),
            Section("Closing Statement", None, (("Father Rowan", CLOSING),)),
        ),
        "This episode discusses relapse, opioid use disorder, compulsive sexual behavior, shame, and recovery support without graphic detail. It is not medical, therapeutic, or emergency advice. If there is overdose risk, self-harm risk, withdrawal danger, violence, or immediate danger, seek trained local emergency or medical support.",
        False,
    ),
)


def run(command: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(command, cwd=str(ROOT), text=True, capture_output=True)
    if check and result.returncode:
        print(result.stdout)
        print(result.stderr)
        raise SystemExit(f"command failed: {' '.join(command)}")
    return result


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def ffprobe_duration(path: Path) -> float:
    result = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)])
    return float(json.loads(result.stdout)["format"]["duration"])


def duration_text(seconds: float) -> tuple[str, str]:
    total = int(round(seconds))
    hours, rem = divmod(total, 3600)
    minutes, secs = divmod(rem, 60)
    rss = f"{hours:02d}:{minutes:02d}:{secs:02d}"
    page = f"{minutes}:{secs:02d}" if hours == 0 else f"{hours}:{minutes:02d}:{secs:02d}"
    return rss, page


def write_wav(path: Path, samples: list[float], sample_rate: int = 44100) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    peak = max(0.001, max(abs(sample) for sample in samples))
    scale = min(0.92 / peak, 1.0)
    with wave.open(str(path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        frames = bytearray()
        for sample in samples:
            value = max(-1.0, min(1.0, sample * scale))
            frames.extend(struct.pack("<h", int(value * 32767)))
        wav.writeframes(bytes(frames))


def bell(t: float, freq: float, start: float, dur: float, amp: float) -> float:
    if t < start or t > start + dur:
        return 0.0
    x = t - start
    env = math.exp(-2.8 * x) * min(1.0, x / 0.035)
    return amp * env * (math.sin(2 * math.pi * freq * x) + 0.42 * math.sin(2 * math.pi * freq * 2.01 * x))


def pad(t: float, freqs: list[float], amp: float, dur: float) -> float:
    fade_in = min(1.0, t / 0.45)
    fade_out = min(1.0, max(0.0, (dur - t) / 0.75))
    env = fade_in * fade_out
    return amp * env * sum(math.sin(2 * math.pi * f * t + i * 0.7) for i, f in enumerate(freqs)) / len(freqs)


def pulse(t: float, freq: float, every: float, amp: float) -> float:
    pos = t % every
    env = math.exp(-8.0 * pos) * min(1.0, pos / 0.02)
    return amp * env * math.sin(2 * math.pi * freq * pos)


def synth_transition(kind: str, path: Path) -> None:
    sample_rate = 44100
    dur = {"witness": 4.8, "heart": 5.4, "practice": 4.6, "recovery": 6.2}[kind]
    rng = random.Random(kind)
    samples: list[float] = []
    for i in range(int(sample_rate * dur)):
        t = i / sample_rate
        if kind == "witness":
            sample = pad(t, [196.0, 293.66, 392.0], 0.070, dur)
            for j, freq in enumerate([392.0, 587.33, 783.99, 659.25]):
                sample += bell(t, freq, 0.35 + j * 0.82, 2.1, 0.050)
            sample += pulse(t, 98.0, 1.20, 0.030)
        elif kind == "heart":
            sample = pad(t, [174.61, 261.63, 349.23, 523.25], 0.082, dur)
            for j, freq in enumerate([349.23, 440.0, 523.25, 698.46]):
                sample += bell(t, freq, 0.60 + j * 0.95, 2.4, 0.043)
            sample += 0.012 * math.sin(2 * math.pi * 55.0 * t) * min(1.0, t / 0.6) * min(1.0, (dur - t) / 0.6)
        elif kind == "practice":
            sample = pad(t, [220.0, 330.0, 440.0], 0.064, dur)
            for start in [0.25, 0.82, 1.41, 2.15, 2.92, 3.58]:
                sample += bell(t, 660.0 + 110.0 * (int(start * 10) % 3), start, 1.3, 0.036)
            sample += pulse(t, 110.0, 0.50, 0.040)
        else:
            sample = pad(t, [146.83, 220.0, 293.66, 440.0], 0.074, dur)
            for j, freq in enumerate([293.66, 369.99, 440.0, 554.37, 659.25]):
                sample += bell(t, freq, 0.50 + j * 0.86, 2.5, 0.039)
            sample += pulse(t, 73.42, 1.55, 0.026)
        sample += rng.uniform(-0.0035, 0.0035) * min(1.0, t / 0.25) * min(1.0, (dur - t) / 0.35)
        samples.append(sample)
    write_wav(path, samples, sample_rate)
    tmp = path.with_suffix(".tmp.wav")
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(path), "-af", "highpass=f=80,lowpass=f=9500,aecho=0.15:0.12:140:0.18,alimiter=limit=0.86", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(tmp)])
    tmp.replace(path)
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(path), "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", "-id3v2_version", "3", str(path.with_suffix(".mp3"))])


def ensure_transition_assets() -> None:
    for kind, path in TRANSITIONS.items():
        synth_transition(kind, path)
    silence = AUDIO_DIR / "the-turning-life-transition-silence.wav"
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", "1.0", "-c:a", "pcm_s16le", str(silence)])
    soundtrack_wav = AUDIO_DIR / "the-turning-life-transition-soundtrack.wav"
    soundtrack_mp3 = AUDIO_DIR / "the-turning-life-transition-soundtrack.mp3"
    concat = AUDIO_DIR / "the-turning-life-transition-soundtrack.concat.txt"
    order = [TRANSITIONS["witness"], silence, TRANSITIONS["heart"], silence, TRANSITIONS["practice"], silence, TRANSITIONS["recovery"]]
    concat.write_text("".join(f"file '{path.as_posix()}'\n" for path in order), encoding="utf-8")
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c:a", "pcm_s16le", str(soundtrack_wav)])
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(soundtrack_wav), "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", "-id3v2_version", "3", str(soundtrack_mp3)])
    concat.unlink(missing_ok=True)
    silence.unlink(missing_ok=True)
    (AUDIO_DIR / "the-turning-life-transition-soundtrack-license.txt").write_text(
        "The Turning Life Transition Soundtrack - Free Use Notice\n\n"
        "These transition music files were procedurally generated for the Project Infinity / Religion of Transformation website. "
        "They use synthesized tones and generated noise only; no third-party samples or commercial music tracks are included.\n\n"
        "The site maintainer may use, copy, modify, remix, publish, and distribute these transition music files for podcast, web, video, and social media use. "
        "Attribution is appreciated but not required. The files are provided as-is, without warranty.\n",
        encoding="utf-8",
    )



def speaker_slug(speaker: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", speaker.lower()).strip("-")


def line_take_name(ep: Episode, section_index: int, line_index: int, speaker: str) -> str:
    return f"e{ep.number:02d}-s{section_index:02d}-l{line_index:03d}-{speaker_slug(speaker)}.wav"


def human_take_path(ep: Episode, section_index: int, line_index: int, speaker: str) -> Path:
    return HUMAN_RECORDING_DIR / ep.slug / "takes" / line_take_name(ep, section_index, line_index, speaker)


def write_human_recording_readme() -> None:
    HUMAN_RECORDING_DIR.mkdir(parents=True, exist_ok=True)
    (HUMAN_RECORDING_DIR / "README.md").write_text(
        "# Human Podcast Recordings\n\n"
        "Place raw actor line takes under `assets/audio/human-recordings/<episode-slug>/takes/` using the exact filenames from the recording packet. "
        "Use mono WAV when possible, 44.1 kHz or 48 kHz, clean room tone, no baked-in music, no reverb, and no final loudness processing. "
        "The build script converts takes into section stems, then adds intro, transitions, ambience, and final podcast loudness.\n\n"
        "Synthetic TTS is draft-only. Public masters should be rendered from consented human recordings.\n",
        encoding="utf-8",
    )


def write_human_recording_packet(selected: set[int]) -> None:
    write_human_recording_readme()
    RECORDING_PACKET_DIR.mkdir(parents=True, exist_ok=True)
    for ep in EPISODES:
        if ep.number not in selected:
            continue
        episode_packet = RECORDING_PACKET_DIR / ep.slug
        episode_packet.mkdir(parents=True, exist_ok=True)
        takes_dir = HUMAN_RECORDING_DIR / ep.slug / "takes"
        takes_dir.mkdir(parents=True, exist_ok=True)
        (takes_dir / ".gitkeep").write_text("", encoding="utf-8")
        manifest: list[dict[str, Any]] = []
        full_lines = [
            f"# Episode {ep.number:02d}: {ep.title} Recording Packet",
            "",
            "Record each listed line as a separate clean WAV file using the exact filename shown.",
            "Keep emotional delivery natural, adult, and intimate; do not perform addiction or trauma as spectacle.",
            "Target peaks around -12 dBFS to -6 dBFS and leave processing, music, ambience, and mastering for the build pipeline.",
            "",
            f"Takes directory: `assets/audio/human-recordings/{ep.slug}/takes/`",
            "",
        ]
        speaker_lines: dict[str, list[str]] = {}
        for section_index, section in enumerate(ep.sections, start=1):
            full_lines.extend([f"## {section_index:02d}. {section.name}", ""])
            for line_index, (speaker, line) in enumerate(section.lines, start=1):
                filename = line_take_name(ep, section_index, line_index, speaker)
                entry = {
                    "episode": ep.number,
                    "episode_slug": ep.slug,
                    "section_index": section_index,
                    "section": section.name,
                    "line_index": line_index,
                    "speaker": speaker,
                    "take_file": f"assets/audio/human-recordings/{ep.slug}/takes/{filename}",
                    "dialogue": line,
                }
                manifest.append(entry)
                block = [f"### {filename}", f"Speaker: {speaker}", "", line, ""]
                full_lines.extend(block)
                speaker_lines.setdefault(speaker, [f"# {speaker} Lines for Episode {ep.number:02d}: {ep.title}", "", f"Takes directory: `assets/audio/human-recordings/{ep.slug}/takes/`", ""])
                speaker_lines[speaker].extend(block)
        (episode_packet / "full-session.md").write_text("\n".join(full_lines).rstrip() + "\n", encoding="utf-8")
        for speaker, lines in speaker_lines.items():
            (episode_packet / f"{speaker_slug(speaker)}.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
        (HUMAN_RECORDING_DIR / ep.slug / "recording-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def missing_human_takes(ep: Episode) -> list[Path]:
    missing: list[Path] = []
    for section_index, section in enumerate(ep.sections, start=1):
        for line_index, (speaker, _) in enumerate(section.lines, start=1):
            path = human_take_path(ep, section_index, line_index, speaker)
            if not path.exists():
                missing.append(path)
    return missing


def deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    merged: dict[str, Any] = dict(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = deep_merge(merged[key], value)
        else:
            merged[key] = value
    return merged


def write_professional_voice_config_example() -> None:
    PROFESSIONAL_VOICE_EXAMPLE.parent.mkdir(parents=True, exist_ok=True)
    PROFESSIONAL_VOICE_EXAMPLE.write_text(json.dumps(DEFAULT_PROFESSIONAL_VOICE_CONFIG, indent=2) + "\n", encoding="utf-8")


def load_professional_voice_config(config_path: Path | None, provider: str) -> dict[str, Any]:
    write_professional_voice_config_example()
    source = config_path or PROFESSIONAL_VOICE_CONFIG
    config = DEFAULT_PROFESSIONAL_VOICE_CONFIG
    if source.exists():
        config = deep_merge(config, json.loads(source.read_text(encoding="utf-8")))
    config = deep_merge(config, {"provider": provider})
    return config


def validate_professional_voice_config(config: dict[str, Any]) -> None:
    provider = config.get("provider", "openai")
    if provider == "openai":
        if not os.environ.get("OPENAI_API_KEY"):
            raise SystemExit(
                "OPENAI_API_KEY is required for professional OpenAI voice generation. "
                f"Example config written to {rel(PROFESSIONAL_VOICE_EXAMPLE)}."
            )
        return
    if provider == "elevenlabs":
        if not os.environ.get("ELEVENLABS_API_KEY"):
            raise SystemExit(
                "ELEVENLABS_API_KEY is required for professional ElevenLabs voice generation. "
                f"Example config written to {rel(PROFESSIONAL_VOICE_EXAMPLE)}."
            )
        voices = config.get("elevenlabs", {}).get("voices", {})
        missing = [speaker for speaker in ("Father Rowan", "Maya Vale", "Amara Keene") if not voices.get(speaker, {}).get("voice_id") or str(voices.get(speaker, {}).get("voice_id", "")).startswith("REPLACE_")]
        if missing:
            raise SystemExit(
                "ElevenLabs voice IDs are missing for: "
                + ", ".join(missing)
                + f". Copy {rel(PROFESSIONAL_VOICE_EXAMPLE)} to {rel(PROFESSIONAL_VOICE_CONFIG)} and set voice IDs."
            )
        return
    raise SystemExit(f"unknown professional voice provider: {provider}")


def post_binary_json(url: str, headers: dict[str, str], payload: dict[str, Any], output: Path) -> None:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            output.write_bytes(response.read())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"voice provider HTTP {exc.code}: {body[:1200]}") from exc
    except urllib.error.URLError as exc:
        raise SystemExit(f"voice provider request failed: {exc}") from exc


def render_openai_line(speaker: str, text: str, output: Path, config: dict[str, Any]) -> None:
    settings = config.get("openai", {})
    voice_settings = settings.get("voices", {}).get(speaker, {})
    payload: dict[str, Any] = {
        "model": settings.get("model", "gpt-4o-mini-tts"),
        "input": text,
        "voice": voice_settings.get("voice", "alloy"),
        "response_format": settings.get("response_format", "wav"),
    }
    instructions = voice_settings.get("instructions") or settings.get("instructions")
    if instructions:
        payload["instructions"] = instructions
    raw = output.with_suffix(f".openai.{payload['response_format']}")
    post_binary_json(
        OPENAI_SPEECH_URL,
        {
            "Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}",
            "Content-Type": "application/json",
        },
        payload,
        raw,
    )
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(raw), "-af", "aformat=channel_layouts=mono,aresample=44100", "-c:a", "pcm_s16le", str(output)])
    raw.unlink(missing_ok=True)


def render_elevenlabs_line(speaker: str, text: str, output: Path, config: dict[str, Any]) -> None:
    settings = config.get("elevenlabs", {})
    voice_settings = settings.get("voices", {}).get(speaker, {})
    voice_id = voice_settings.get("voice_id")
    if not voice_id or str(voice_id).startswith("REPLACE_"):
        raise SystemExit(f"missing ElevenLabs voice_id for {speaker}")
    body: dict[str, Any] = {
        "text": text,
        "model_id": settings.get("model_id", "eleven_multilingual_v2"),
    }
    merged_voice_settings = deep_merge(settings.get("voice_settings", {}), voice_settings.get("voice_settings", {}))
    if merged_voice_settings:
        body["voice_settings"] = merged_voice_settings
    output_format = settings.get("output_format", "mp3_44100_128")
    raw = output.with_suffix(".elevenlabs.mp3")
    post_binary_json(
        f"{ELEVENLABS_SPEECH_URL}/{voice_id}?output_format={output_format}",
        {
            "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
            "Content-Type": "application/json",
        },
        body,
        raw,
    )
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(raw), "-af", "aformat=channel_layouts=mono,aresample=44100", "-c:a", "pcm_s16le", str(output)])
    raw.unlink(missing_ok=True)


def render_professional_line(speaker: str, text: str, output: Path, config: dict[str, Any]) -> None:
    provider = config.get("provider", "openai")
    if provider == "openai":
        render_openai_line(speaker, text, output, config)
        return
    if provider == "elevenlabs":
        render_elevenlabs_line(speaker, text, output, config)
        return
    raise SystemExit(f"unknown professional voice provider: {provider}")

def write_transcript(ep: Episode) -> None:
    parts: list[str] = []
    if ep.number == 5:
        parts.extend(["The Turning Life", f"Episode 05: {ep.title}", f"Date: {ep.date}"])
        if ep.content_note:
            parts.extend(["", f"Content note: {ep.content_note}"])
    else:
        parts.append(ep.title)
    parts.extend(["", "[Intro: original geometric rhythm built from four, seven, and twelve-count cycles.]", "", PARK_CUE, "", OFFICE_CUE, "", f"[Soundtrack: {SOUNDTRACK_NOTE}]", "", f"[Structure: {SECTION_STRUCTURE}]"])
    for section in ep.sections:
        parts.extend(["", f"[Section: {section.name}]"])
        if section.transition:
            parts.append(f"[Transition music: {TRANSITION_LABELS[section.transition]}.]")
        parts.append("")
        for speaker, line in section.lines:
            parts.append(f"{speaker}: {line}")
            parts.append("")
    (TRANSCRIPT_DIR / f"{ep.slug}.txt").write_text("\n".join(parts).rstrip() + "\n", encoding="utf-8")



def adjusted_tts_voice_params(ep: Episode, section_index: int, line_index: int, speaker: str) -> tuple[str, str, str]:
    voice, base_rate, base_pitch = VOICES[speaker]
    rng = random.Random(f"voice-jitter-{ep.slug}-{section_index}-{line_index}-{speaker}")
    rate_value = int(base_rate.removesuffix("%")) + rng.randint(-4, 4)
    pitch_value = int(base_pitch.removesuffix("Hz")) + rng.randint(-3, 3)
    return voice, f"{rate_value:+d}%", f"{pitch_value:+d}Hz"

def render_line(ep: Episode, section_index: int, line_index: int, speaker: str, text: str, output: Path, voice_source: str, professional_config: dict[str, Any] | None) -> None:
    if voice_source == "professional":
        if professional_config is None:
            raise SystemExit("professional voice config was not loaded")
        render_professional_line(speaker, text, output, professional_config)
        return

    if voice_source == "human":
        source = human_take_path(ep, section_index, line_index, speaker)
        if not source.exists():
            raise SystemExit(f"missing human take: {rel(source)}")
        run([
            "ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(source),
            "-af", "aformat=channel_layouts=mono,aresample=44100,highpass=f=75,lowpass=f=15500",
            "-c:a", "pcm_s16le", str(output),
        ])
        return

    voice, rate, pitch = adjusted_tts_voice_params(ep, section_index, line_index, speaker)
    raw = output.with_suffix(".mp3")
    last_error = ""
    for attempt in range(1, 5):
        result = run(["edge-tts", "--voice", voice, "--rate", rate, "--pitch", pitch, "--text", text, "--write-media", str(raw)], check=False)
        if result.returncode == 0 and raw.exists() and raw.stat().st_size > 0:
            break
        last_error = (result.stdout + result.stderr).strip()
        raw.unlink(missing_ok=True)
        print(f"  retrying TTS for {speaker} line after attempt {attempt}", flush=True)
    else:
        raise SystemExit(last_error or f"edge-tts failed for {speaker}: {text}")
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(raw), "-af", "aformat=channel_layouts=mono,aresample=44100", "-c:a", "pcm_s16le", str(output)])
    raw.unlink(missing_ok=True)

def concat_files(files: list[Path], output: Path) -> None:
    concat = output.with_suffix(".concat.txt")
    concat.write_text("".join(f"file '{path.as_posix()}'\n" for path in files), encoding="utf-8")
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-f", "concat", "-safe", "0", "-i", str(concat), "-c:a", "pcm_s16le", str(output)])
    concat.unlink(missing_ok=True)


def make_silence(path: Path, seconds: float) -> None:
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{seconds:.3f}", "-c:a", "pcm_s16le", str(path)])


def render_section(ep: Episode, section: Section, section_index: int, track_dir: Path, tmp: Path, voice_source: str, professional_config: dict[str, Any] | None) -> Path:
    section_dir = tmp / f"section-{section_index:02d}"
    section_dir.mkdir(parents=True, exist_ok=True)
    pause = tmp / "pause-short.wav"
    files: list[Path] = []
    for line_index, (speaker, text) in enumerate(section.lines, start=1):
        wav = section_dir / f"line-{line_index:02d}-{speaker.lower().replace(' ', '-')}.wav"
        render_line(ep, section_index, line_index, speaker, text, wav, voice_source, professional_config)
        files.append(wav)
        if line_index < len(section.lines):
            files.append(pause)
    section_slug = re.sub(r"[^a-z0-9]+", "-", section.name.lower()).strip("-")
    section_output = track_dir / f"section-{section_index:02d}-{section_slug}.wav"
    concat_files(files, section_output)
    return section_output


def make_park_ambience(ep: Episode, track_dir: Path, seconds: float) -> Path:
    bed = track_dir / "park-ambience.wav"
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-f", "lavfi", "-i", f"anoisesrc=color=brown:amplitude=0.010:duration={seconds:.3f}:sample_rate=44100", "-af", "highpass=f=260,lowpass=f=4300,volume=0.18", "-c:a", "pcm_s16le", str(bed)])
    bird_files: list[Path] = []
    count = max(5, min(12, int(seconds // 38) + 4))
    for i in range(count):
        freq = 1750 + ((ep.number * 317 + i * 431) % 1450)
        dur = 0.13 + ((i % 3) * 0.045)
        bird = track_dir / f"bird-call-{i:02d}.wav"
        run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-f", "lavfi", "-i", f"sine=frequency={freq}:duration={dur:.3f}:sample_rate=44100", "-af", "afade=t=in:st=0:d=0.025,afade=t=out:st=0.07:d=0.08,volume=0.020", "-c:a", "pcm_s16le", str(bird)])
        bird_files.append(bird)
    inputs = ["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(bed)]
    for bird in bird_files:
        inputs.extend(["-i", str(bird)])
    labels = ["[0:a]"]
    filters: list[str] = []
    available = max(12.0, seconds - 18.0)
    for i, _ in enumerate(bird_files, start=1):
        stamp = 7.5 + ((ep.number * 9.7 + i * 23.3) % available)
        delay = int(stamp * 1000)
        filters.append(f"[{i}:a]adelay={delay}|{delay}[c{i}]")
        labels.append(f"[c{i}]")
    out = track_dir / "park-ambience-mix.wav"
    filt = ";".join(filters) + ";" + "".join(labels) + f"amix=inputs={len(labels)}:duration=first:normalize=0,alimiter=limit=0.45[out]"
    run(inputs + ["-filter_complex", filt, "-map", "[out]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(out)])
    return out


def make_train_ambience(track_dir: Path, seconds: float) -> Path:
    train = track_dir / "distant-train.wav"
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-f", "lavfi", "-i", f"aevalsrc=0.030*sin(2*PI*82*t)*(0.55+0.45*sin(2*PI*0.11*t)):s=44100:d={seconds:.3f}", "-af", "lowpass=f=180,volume=0.040", "-c:a", "pcm_s16le", str(train)])
    return train

def make_soft_music_bed(ep: Episode, track_dir: Path, seconds: float) -> Path:
    sample_rate = 44100
    rng = random.Random(f"soft-music-{ep.slug}")
    chords = [
        [146.83, 220.00, 293.66],
        [164.81, 246.94, 329.63],
        [174.61, 261.63, 349.23],
        [196.00, 293.66, 392.00],
    ]
    samples: list[float] = []
    total = int(sample_rate * seconds)
    for i in range(total):
        t = i / sample_rate
        chord = chords[int(t // 24) % len(chords)]
        fade = min(1.0, t / 5.0, max(0.0, (seconds - t) / 6.0))
        drift = 1.0 + 0.002 * math.sin(2 * math.pi * 0.013 * t + ep.number)
        value = 0.0
        for idx, freq in enumerate(chord):
            phase = idx * 0.73 + rng.random() * 0.12
            value += math.sin(2 * math.pi * freq * drift * t + phase)
            value += 0.35 * math.sin(2 * math.pi * freq * 2.0 * drift * t + phase / 2)
        samples.append((value / (len(chord) * 1.35)) * 0.014 * fade)
    raw = track_dir / "soft-muffled-music-raw.wav"
    out = track_dir / "soft-muffled-music.wav"
    write_wav(raw, samples, sample_rate)
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(raw), "-af", "highpass=f=90,lowpass=f=1350,aecho=0.08:0.06:280:0.12,volume=0.78", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(out)])
    raw.unlink(missing_ok=True)
    return out


def make_office_ambience(ep: Episode, track_dir: Path, seconds: float) -> Path:
    sample_rate = 44100
    total = int(sample_rate * seconds)
    rng = random.Random(f"office-{ep.slug}")
    samples = [0.0] * total
    smooth = 0.0
    for i in range(total):
        t = i / sample_rate
        smooth = smooth * 0.997 + rng.uniform(-1.0, 1.0) * 0.003
        samples[i] += smooth * 0.32
        samples[i] += 0.0018 * math.sin(2 * math.pi * 61.0 * t + 0.3)
        samples[i] += 0.0012 * math.sin(2 * math.pi * 123.0 * t + 1.1)

    def add_noise_burst(start: float, dur: float, amp: float, low_tone: float | None = None) -> None:
        start_i = max(0, int(start * sample_rate))
        length = max(1, int(dur * sample_rate))
        for j in range(length):
            idx = start_i + j
            if idx >= total:
                break
            x = j / length
            env = math.sin(math.pi * x) ** 0.8
            value = rng.uniform(-1.0, 1.0) * amp * env
            if low_tone:
                value += amp * 0.45 * math.sin(2 * math.pi * low_tone * (j / sample_rate)) * env
            samples[idx] += value

    for _ in range(max(8, int(seconds // 8))):
        add_noise_burst(rng.uniform(8.0, max(9.0, seconds - 4.0)), rng.uniform(0.012, 0.035), rng.uniform(0.012, 0.024))
    for _ in range(max(3, int(seconds // 32))):
        add_noise_burst(rng.uniform(14.0, max(15.0, seconds - 5.0)), rng.uniform(0.18, 0.55), rng.uniform(0.004, 0.009))
    for _ in range(max(2, int(seconds // 55))):
        add_noise_burst(rng.uniform(20.0, max(21.0, seconds - 8.0)), rng.uniform(0.35, 0.9), rng.uniform(0.003, 0.006), rng.uniform(90.0, 170.0))

    raw = track_dir / "office-ambience-raw.wav"
    out = track_dir / "office-ambience.wav"
    write_wav(raw, samples, sample_rate)
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(raw), "-af", "highpass=f=120,lowpass=f=4200,volume=0.72", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(out)])
    raw.unlink(missing_ok=True)
    return out


def make_human_reactions(ep: Episode, track_dir: Path, seconds: float) -> Path:
    sample_rate = 44100
    total = int(sample_rate * seconds)
    rng = random.Random(f"human-reactions-{ep.slug}")
    samples = [0.0] * total
    kinds = ["throat", "cough", "muffled_laugh", "sigh", "sneeze"]
    count = max(3, min(9, int(seconds // 85) + 3))
    event_times = sorted(rng.uniform(22.0, max(24.0, seconds - 18.0)) for _ in range(count))

    def add_event(start: float, kind: str) -> None:
        dur = {"throat": 0.34, "cough": 0.48, "muffled_laugh": 0.75, "sigh": 0.62, "sneeze": 0.55}[kind]
        start_i = max(0, int(start * sample_rate))
        length = max(1, int(dur * sample_rate))
        base = rng.uniform(105.0, 190.0)
        for j in range(length):
            idx = start_i + j
            if idx >= total:
                break
            x = j / length
            env = math.sin(math.pi * x)
            noise = rng.uniform(-1.0, 1.0)
            if kind == "muffled_laugh":
                pulse_env = 0.5 + 0.5 * math.sin(2 * math.pi * 5.5 * (j / sample_rate))
                value = 0.014 * env * pulse_env * (math.sin(2 * math.pi * (base + 35.0) * (j / sample_rate)) + 0.35 * noise)
            elif kind == "cough":
                double = 1.0 if x < 0.42 else 0.65
                value = 0.020 * env * double * (0.65 * noise + 0.35 * math.sin(2 * math.pi * base * (j / sample_rate)))
            elif kind == "sneeze":
                value = 0.018 * env * (0.82 * noise + 0.18 * math.sin(2 * math.pi * (base * 1.4) * (j / sample_rate)))
            elif kind == "sigh":
                value = 0.012 * env * (math.sin(2 * math.pi * (base * (1.0 - 0.35 * x)) * (j / sample_rate)) + 0.20 * noise)
            else:
                value = 0.013 * env * (math.sin(2 * math.pi * base * (j / sample_rate)) + 0.35 * noise)
            samples[idx] += value

    for time, kind in zip(event_times, (rng.choice(kinds) for _ in event_times)):
        add_event(time, kind)

    raw = track_dir / "human-reactions-raw.wav"
    out = track_dir / "human-reactions.wav"
    write_wav(raw, samples, sample_rate)
    run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(raw), "-af", "highpass=f=95,lowpass=f=2600,aecho=0.03:0.025:38:0.08,volume=0.70", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(out)])
    raw.unlink(missing_ok=True)
    return out


def render_episode(ep: Episode, voice_source: str = "professional", professional_config: dict[str, Any] | None = None) -> tuple[int, str, str]:
    if voice_source == "human":
        missing = missing_human_takes(ep)
        if missing:
            write_human_recording_packet({ep.number})
            preview = "\n".join(f"- {rel(path)}" for path in missing[:10])
            more = f"\n... and {len(missing) - 10} more" if len(missing) > 10 else ""
            raise SystemExit(f"missing {len(missing)} human recording take(s) for episode {ep.number}. Recording packet written to {rel(RECORDING_PACKET_DIR / ep.slug)}.\n{preview}{more}")
    write_transcript(ep)
    track_dir = MASTER_DIR / ep.slug
    track_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=f"{ep.slug}-", dir="/tmp") as tmp_str:
        tmp = Path(tmp_str)
        make_silence(tmp / "pause-short.wav", 0.28)
        make_silence(tmp / "pause-long.wav", 0.62)
        section_assets: list[dict[str, Any]] = []
        dry_sections: list[Path] = []
        program_parts: list[Path] = [INTRO_WAV, tmp / "pause-long.wav"]
        cursor = ffprobe_duration(INTRO_WAV) + 0.62
        transition_events: list[dict[str, Any]] = []
        for index, section in enumerate(ep.sections, start=1):
            if section.transition:
                transition = TRANSITIONS[section.transition]
                program_parts.extend([tmp / "pause-long.wav", transition, tmp / "pause-short.wav"])
                transition_duration = ffprobe_duration(transition)
                transition_events.append({
                    "section": section.name,
                    "kind": section.transition,
                    "label": TRANSITION_LABELS[section.transition],
                    "source": rel(transition),
                    "start_seconds": round(cursor + 0.62, 3),
                    "duration_seconds": round(transition_duration, 3),
                })
                cursor += 0.62 + transition_duration + 0.28
            section_wav = render_section(ep, section, index, track_dir, tmp, voice_source, professional_config)
            section_duration = ffprobe_duration(section_wav)
            dry_sections.append(section_wav)
            program_parts.append(section_wav)
            program_parts.append(tmp / "pause-long.wav" if index == len(ep.sections) else tmp / "pause-short.wav")
            section_assets.append({
                "name": section.name,
                "source": rel(section_wav),
                "start_seconds": round(cursor, 3),
                "duration_seconds": round(section_duration, 3),
                "transition_before": section.transition,
            })
            cursor += section_duration + (0.62 if index == len(ep.sections) else 0.28)
        dialogue_source = track_dir / "dialogue-source.wav"
        dialogue_parts: list[Path] = []
        for index, section_path in enumerate(dry_sections, start=1):
            dialogue_parts.append(section_path)
            if index < len(dry_sections):
                dialogue_parts.append(tmp / "pause-long.wav")
        concat_files(dialogue_parts, dialogue_source)
        program_source = track_dir / "program-source-with-intro-and-transitions.wav"
        concat_files(program_parts, program_source)
        seconds = ffprobe_duration(program_source)
        park = make_park_ambience(ep, track_dir, seconds)
        soft_music = make_soft_music_bed(ep, track_dir, seconds)
        office = make_office_ambience(ep, track_dir, seconds)
        human_reactions = make_human_reactions(ep, track_dir, seconds)
        train = make_train_ambience(track_dir, seconds) if ep.train else None
        premaster = track_dir / "premaster-mix.wav"
        voice_filter = (
            "[0:a]highpass=f=85,lowpass=f=9800,equalizer=f=250:width_type=h:width=140:g=1.0,"
            "equalizer=f=5400:width_type=h:width=2600:g=-1.2,acompressor=threshold=-22dB:ratio=2.2:attack=18:release=180:makeup=1.4,"
            "aecho=0.035:0.035:24:0.12[voice];[1:a]lowpass=f=2600,volume=0.040[room];"
            "[2:a]volume=0.42[park];[3:a]lowpass=f=1500,volume=0.18[music];[4:a]lowpass=f=3600,volume=0.30[office];[5:a]volume=0.25[react]"
        )
        inputs = [
            "ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(program_source),
            "-f", "lavfi", "-i", f"anoisesrc=color=pink:amplitude=0.010:duration={seconds:.3f}:sample_rate=44100",
            "-i", str(park), "-i", str(soft_music), "-i", str(office), "-i", str(human_reactions),
        ]
        if train:
            filt = voice_filter + ";[6:a]volume=0.85[train];[voice][room][park][music][office][react][train]amix=inputs=7:duration=first:normalize=0,alimiter=limit=0.84[out]"
            inputs.extend(["-i", str(train)])
        else:
            filt = voice_filter + ";[voice][room][park][music][office][react]amix=inputs=6:duration=first:normalize=0,alimiter=limit=0.84[out]"
        run(inputs + ["-filter_complex", filt, "-map", "[out]", "-ar", "44100", "-ac", "1", "-c:a", "pcm_s16le", str(premaster)])
        wav_out = AUDIO_DIR / f"{ep.slug}.wav"
        mp3_out = AUDIO_DIR / f"{ep.slug}.mp3"
        run(["python3", str(LOUDNORM), str(premaster), str(wav_out), "--target", "-16", "--true-peak", "-1.5", "--lra", "11", "--sample-rate", "44100", "--channels", "1", "--codec", "pcm_s16le"])
        run(["ffmpeg", "-hide_banner", "-nostats", "-y", "-i", str(wav_out), "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "96k", "-id3v2_version", "3", str(mp3_out)])
        final_seconds = ffprobe_duration(mp3_out)
        rss_duration, page_duration = duration_text(final_seconds)
        manifest = {
            "schema": "turning-life-master-track-v1",
            "episode": ep.number,
            "title": ep.title,
            "slug": ep.slug,
            "purpose": "Non-destructive mix map. Dry source dialogue and section stems stay intact; music, ambience, and effects are added in the final mix from this master file.",
            "structure": [section.name for section in ep.sections],
            "source_tracks": {
                "dry_dialogue_source": rel(dialogue_source),
                "program_source_with_intro_and_transitions": rel(program_source),
                "geometric_intro": rel(INTRO_WAV),
                "section_stems": section_assets,
            },
            "music_tracks": {
                "transition_soundtrack": rel(AUDIO_DIR / "the-turning-life-transition-soundtrack.wav"),
                "transition_events": transition_events,
            },
            "ambience_tracks": {
                "park": rel(park),
                "soft_muffled_music": rel(soft_music),
                "office_noise": rel(office),
                "human_reactions": rel(human_reactions),
                "distant_train": rel(train) if train else None,
            },
            "voice_processing": {
                "tts_line_variation": "Synthetic draft voices use deterministic per-line rate jitter of +/-4 percent and pitch jitter of +/-3 Hz.",
                "human_reactions_policy": "Coughs, sneezes, grunts, throat-clears, sighs, and muffled laughter are sparse low-level ambience, not foreground dialogue.",
            },
            "mix_outputs": {
                "premaster": rel(premaster),
                "archive_wav": rel(wav_out),
                "feed_mp3": rel(mp3_out),
                "duration_seconds": round(final_seconds, 3),
                "itunes_duration": rss_duration,
                "byte_length": mp3_out.stat().st_size,
            },
            "mix_policy": "To add or remove sound effects, edit this manifest and rerender the final mix. Do not destructively modify dry_dialogue_source or section_stems.",
        }
        (track_dir / f"{ep.slug}.master.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        return mp3_out.stat().st_size, rss_duration, page_duration


def update_feed(metadata: dict[int, tuple[int, str, str]]) -> None:
    path = ROOT / "podcast.xml"
    text = path.read_text(encoding="utf-8")
    summary = "Recovery-centered dialogues about everyday life, love, consent, relationship, and daily transformation with distinct episode sections, personal-life check-ins, subtle park ambience, natural conversation hesitations, and an original free-use transition soundtrack."
    text = re.sub(r"<lastBuildDate>.*?</lastBuildDate>", f"<lastBuildDate>{LAST_BUILD}</lastBuildDate>", text)
    text = re.sub(r"<description>.*?</description>", f"<description>{html.escape(summary)}</description>", text, count=1)
    text = re.sub(r"<itunes:summary>.*?</itunes:summary>", f"<itunes:summary>{html.escape(summary)}</itunes:summary>", text, count=1)
    for ep in EPISODES:
        escaped_title = html.escape(f"{ep.number}. {ep.title}")
        escaped_description = html.escape(ep.description)
        text, count = re.subn(
            rf"(<title>{re.escape(escaped_title)}</title>\s*<description>).*?(</description>)",
            lambda match: match.group(1) + escaped_description + match.group(2),
            text,
            count=1,
            flags=re.S,
        )
        if count != 1:
            raise SystemExit(f"failed to update RSS description for {ep.slug}")
        text, count = re.subn(
            rf"(<title>{re.escape(escaped_title)}</title>.*?<content:encoded><!\[CDATA\[\s*<p>).*?(</p>)",
            lambda match: match.group(1) + escaped_description + match.group(2),
            text,
            count=1,
            flags=re.S,
        )
        if count != 1:
            raise SystemExit(f"failed to update RSS content description for {ep.slug}")

        size, rss_duration, _ = metadata[ep.number]
        text, count = re.subn(
            rf'(<enclosure url="{re.escape(BASE_URL)}assets/audio/{re.escape(ep.slug)}\.mp3" length=")\d+(" type="audio/mpeg" />\s*<itunes:author>Religion of Transformation</itunes:author>\s*<itunes:duration>)[^<]+(</itunes:duration>)',
            rf"\g<1>{size}\g<2>{rss_duration}\g<3>",
            text,
            flags=re.S,
        )
        if count != 1:
            raise SystemExit(f"failed to update RSS enclosure for {ep.slug}")
        section_note = f"Structure: {SECTION_STRUCTURE}"
        master_path = MASTER_DIR / ep.slug / f"{ep.slug}.master.json"
        master_note = ""
        if master_path.exists():
            master_url = f"{BASE_URL}{rel(master_path)}"
            master_note = f"\n        <p>Master track: <a href=\"{master_url}\">non-destructive mix manifest</a></p>"
        text, count = re.subn(
            rf'(<content:encoded><!\[CDATA\[.*?)(\s*<p><a href="{re.escape(BASE_URL)}assets/transcripts/{re.escape(ep.slug)}\.txt">Read the transcript</a></p>)',
            lambda match: re.sub(
                r"\s*<p>Integrated emotional moment:.*?</p>|\s*<p>Closing statement:.*?</p>|\s*<p>Sound design:.*?</p>|\s*<p>Soundtrack:.*?</p>|\s*<p>Structure:.*?</p>|\s*<p>Master track:.*?</p>|\s*<p>Human recording packet:.*?</p>",
                "",
                match.group(1),
                flags=re.S,
            )
            + f"\n        <p>{html.escape(section_note)}</p>"
            + f"\n        <p>{html.escape(ep.emotional_note)}</p>"
            + "\n        <p>Sound design: natural hesitations, occasional soft park ambience, and original transition music cues.</p>"
            + f"\n        <p>Soundtrack: {html.escape(SOUNDTRACK_NOTE)}</p>"
            + master_note
            + f"\n        <p>Closing statement: {html.escape(CLOSING)}</p>"
            + match.group(2),
            text,
            flags=re.S,
        )
        if count < 1:
            raise SystemExit(f"failed to update RSS content note for {ep.slug}")
    path.write_text(text, encoding="utf-8")


def update_episode_card(card: str, ep: Episode, page_duration: str) -> str:
    card = re.sub(rf"Episode {ep.number:02d} \| [0-9:]+ \|", f"Episode {ep.number:02d} | {page_duration} |", card)
    card = re.sub(
        r"(<h3>.*?</h3>\s*<p>).*?(</p>)",
        lambda match: match.group(1) + html.escape(ep.description) + match.group(2),
        card,
        count=1,
        flags=re.S,
    )
    card = re.sub(
        r"\s*<li>Integrated emotional moment:.*?</li>|\s*<li>Closing statement:.*?</li>|\s*<li>Sound design:.*?</li>|\s*<li>Soundtrack:.*?</li>|\s*<li>Structure:.*?</li>|\s*<li>Master track:.*?</li>|\s*<li>Human recording packet:.*?</li>",
        "",
        card,
        flags=re.S,
    )
    master_path = MASTER_DIR / ep.slug / f"{ep.slug}.master.json"
    master_note = ""
    if master_path.exists():
        master_note = f"\n            <li>Master track: <a href=\"{rel(master_path)}\">non-destructive mix manifest</a></li>"
    extra = (
        f"\n            <li>Structure: {html.escape(SECTION_STRUCTURE)}</li>"
        f"\n            <li>{html.escape(ep.emotional_note)}</li>"
        "\n            <li>Sound design: natural hesitations, occasional soft park ambience, and original transition stingers.</li>"
        f"\n            <li>Soundtrack: {html.escape(SOUNDTRACK_NOTE)}</li>"
        + master_note
        + f"\n            <li>Closing statement: {html.escape(CLOSING)}</li>"
    )
    return re.sub(r"(\s*</ul>)", extra + r"\1", card, count=1)


def update_html(metadata: dict[int, tuple[int, str, str]]) -> None:
    path = ROOT / "podcast.html"
    text = path.read_text(encoding="utf-8")
    text = re.sub(
        r"Episodes are built as table conversations:.*?</p>",
        "Episodes are built as sectioned table conversations: opening, personal life check-in, teaching, emotional turn, daily practice, and closing statement. Maya and Amara are West Coast adult partners who speak from recovery and ordinary daily life, and Father Rowan answers slowly as a religious priest. Each episode uses dry source dialogue, separate transition music and ambience stems, and a master-track manifest so sound effects can be changed without altering the source tracks.</p>",
        text,
        count=1,
        flags=re.S,
    )
    for ep in EPISODES:
        _, _, page_duration = metadata[ep.number]
        text, count = re.subn(rf'(<article class="episode-card" id="episode-{ep.number:02d}">.*?</article>)', lambda match: update_episode_card(match.group(1), ep, page_duration), text, flags=re.S)
        if count != 1:
            raise SystemExit(f"failed to update episode card {ep.number}")
    soundtrack_card = """
        <article class="page-card">
          <h3>Transition Soundtrack</h3>
          <p>Original procedural transition music for episode bridges, generated without third-party samples and published for free site use.</p>
          <div class="episode-actions">
            <a class="button secondary" href="assets/audio/the-turning-life-transition-soundtrack.mp3">MP3</a>
            <a class="button secondary" href="assets/audio/the-turning-life-transition-soundtrack.wav">WAV</a>
            <a class="button secondary" href="assets/audio/the-turning-life-transition-soundtrack-license.txt">Free Use Notice</a>
          </div>
        </article>
"""
    text = re.sub(r"\s*<article class=\"page-card\">\s*<h3>Transition Soundtrack</h3>.*?</article>", "", text, flags=re.S)
    text = text.replace('        <article class="transparency-panel">\n          <h3>Production Covenant</h3>', soundtrack_card + '        <article class="transparency-panel">\n          <h3>Production Covenant</h3>')
    covenant = "<li>Each episode uses distinct sections, a personal life check-in, randomized subtle tone and pitch variation, sparse muffled human reactions, soft background music, office-room noise, subtle park ambience, original free-use transition stingers, non-destructive master-track manifests, and a consistent closing statement.</li>"
    text = re.sub(r"\s*<li>Each episode includes one .*?emotional.*?</li>|\s*<li>Each episode uses natural conversation.*?</li>|\s*<li>Each episode uses distinct sections.*?</li>", "", text, flags=re.S)
    text = text.replace("<li>Teachings should end with a concrete practice, not vague inspiration.</li>", "<li>Teachings should end with a concrete practice, not vague inspiration.</li>\n            " + covenant)
    path.write_text(text, encoding="utf-8")


def update_docs() -> None:
    readme = ROOT / "README.md"
    text = readme.read_text(encoding="utf-8")
    text = re.sub(
        r"- The podcast page includes three-speaker generated episode audio files with .*?`podcast\.xml` RSS feed metadata; update feed base URLs if a custom domain replaces GitHub Pages\.",
        "- The podcast page includes sectioned three-speaker generated episode audio files with personal-life check-ins, an original geometric rhythm intro, integrated emotional moments, natural hesitations, subtle park ambience, an original free-use transition soundtrack, non-destructive master-track manifests, a recurring closing statement, transcript links, and `podcast.xml` RSS feed metadata; update feed base URLs if a custom domain replaces GitHub Pages.",
        text,
    )
    if "master-track manifests" not in text:
        text = text.replace("- Podcast episode audio files live in `assets/audio/`, with transcripts in `assets/transcripts/`.", "- Podcast episode audio files live in `assets/audio/`, with transcripts in `assets/transcripts/`. Non-destructive podcast mix manifests and stems live in `assets/audio/master-tracks/`.")
    readme.write_text(text, encoding="utf-8")

    docs = ROOT / "docs" / "podcast-production-pipeline.md"
    text = docs.read_text(encoding="utf-8")
    text = re.sub(r"\n## Emotional Beats\n\n.*?(?=\n## |\Z)", "\n", text, flags=re.S)
    if "## Episode Sections" not in text:
        text = text.replace("\n## Episode Pipeline\n", f"\n## Episode Sections\n\nEach episode should use distinct, listener-recognizable sections: {SECTION_STRUCTURE} The personal life check-in lets Maya and Amara mention ordinary household, relationship, recovery, or daily-practice moments and how the religion helped them name truth, consent, boundaries, service, or support. Do not imply the religion cures addiction, replaces trained care, or guarantees transformation.\n\n## Episode Pipeline\n")
    if "## Master Track Manifests" not in text:
        text = text.replace("\n## Audio Specifications\n", "\n## Master Track Manifests\n\nPodcast mixes must be non-destructive. Keep dry dialogue and section stems separate from music, ambience, and sound effects. For each episode, write a master-track JSON file under `assets/audio/master-tracks/<episode-slug>/<episode-slug>.master.json` that lists the dry dialogue source, section stems, transition music cues, ambience stems, final premaster, public WAV, and MP3. To add or remove sound effects, edit the manifest and rerender the mix; do not alter the source dialogue tracks.\n\n## Audio Specifications\n")
    if "## Transition Soundtrack" not in text:
        text = text.replace("\n## House Sound\n", "\n## Transition Soundtrack\n\nThe site uses original free-use transition music generated from procedural synthesis, with no third-party samples. Keep transition cues short, low in the mix, and tied to section changes rather than interrupting emotional disclosure. Current soundtrack assets live in `assets/audio/the-turning-life-transition-*` and the combined soundtrack is `assets/audio/the-turning-life-transition-soundtrack.mp3` / `.wav`.\n\n## House Sound\n")
    if "## Natural Dialogue and Park Ambience" not in text:
        text = text.replace("\n## House Sound\n", "\n## Natural Dialogue and Park Ambience\n\nDialogue should sound like people thinking together at a table. Add occasional natural hesitations, repeated words, and self-corrections sparingly; avoid turning stutters into comedy, caricature, or distraction. Public episodes may carry subtle park ambience, such as low air, distant leaves, and light bird calls, mixed under the voices and kept below the teaching.\n\n## House Sound\n")
    text = text.replace("- include one short emotional beat where a host names the feeling under the lesson", "- include one restrained emotional moment inside the conversation and close with the house statement")
    if "- a personal life check-in" not in text:
        text = text.replace("- open with a direct everyday listener problem in the first 15 seconds", "- open with a direct everyday listener problem in the first 15 seconds\n- include a personal life check-in where the hosts connect practice to ordinary life without promising cures")
    if "- render from a master-track manifest" not in text:
        text = text.replace("- a closing practice the listener can do today", "- a closing practice the listener can do today\n- render from a master-track manifest so source dialogue, music, ambience, and sound effects stay separable")
    docs.write_text(text, encoding="utf-8")

    skill = Path("/root/.codex/skills/make-site-podcast/SKILL.md")
    if skill.exists():
        skill_text = skill.read_text(encoding="utf-8")
        skill_text = skill_text.replace(
            "3. Write or update the script, transcript, episode notes, and page copy together so the public page, transcript, and RSS item agree. Ground each episode in everyday life, not only doctrine, and include one restrained emotional beat.",
            "3. Write or update the script, transcript, episode notes, and page copy together so the public page, transcript, and RSS item agree. Use distinct sections: opening, personal life check-in, teaching, emotional turn, daily practice, and closing statement. Ground each episode in everyday life, not only doctrine, and include one restrained emotional beat inside the conversation.",
        )
        skill_text = skill_text.replace(
            "4. Generate or import audio. Prepend the original geometric intro unless the user explicitly asks for a cold open. Keep a WAV archive master and an MP3 feed file in `assets/audio/`.",
            "4. Generate or import audio. Prepend the original geometric intro unless the user explicitly asks for a cold open. Keep dry dialogue and section stems separate from music, ambience, and effects. Write a non-destructive master-track manifest under `assets/audio/master-tracks/<episode-slug>/<episode-slug>.master.json`, then render the WAV archive master and MP3 feed file from that manifest.",
        )
        if "personal life check-in" not in skill_text.split("## Content Guardrails", 1)[-1]:
            skill_text = skill_text.replace(
                "Keep teachings close to ordinary life: work, chores, cravings, conflict, rest, money stress, meals, errands, family, texts, sleep, and repair after conflict.",
                "Keep teachings close to ordinary life: work, chores, cravings, conflict, rest, money stress, meals, errands, family, texts, sleep, and repair after conflict. Personal life check-ins may say the religion helped the hosts name truth, consent, boundaries, service, support, or repair, but must not imply a cure or replacement for trained care.",
            )
        if "master-track manifest" not in skill_text.split("## Finish Criteria", 1)[-1]:
            skill_text = skill_text.replace(
                "- audio and transcript files exist at the paths used by the page/feed",
                "- audio and transcript files exist at the paths used by the page/feed\n- dry source dialogue, section stems, ambience/music/effect stems, and a master-track manifest exist for each rendered episode",
            )
        skill.write_text(skill_text, encoding="utf-8")

    workflow = Path("/root/.codex/skills/make-site-podcast/references/site-workflow.md")
    if workflow.exists():
        workflow_text = workflow.read_text(encoding="utf-8")
        workflow_text = workflow_text.replace("## Emotional Close", "## Emotional Moment")
        if "## Episode Sections" not in workflow_text:
            workflow_text = workflow_text.replace("\n## Dialogue Pattern\n", f"\n## Episode Sections\n\nUse this section structure unless the user asks otherwise: {SECTION_STRUCTURE} The personal life check-in should show Maya and Amara connecting practice to ordinary life and naming how the religion helped with honesty, consent, service, support, or repair without promising cures.\n\n## Dialogue Pattern\n")
        if "## Master Track Manifest" not in workflow_text:
            workflow_text = workflow_text.replace("\n## Episode Assets\n", "\n## Master Track Manifest\n\nEach produced episode should keep source audio non-destructive. Store dry section stems and ambience/music/effect stems under `assets/audio/master-tracks/<episode-slug>/`, then write `<episode-slug>.master.json` to list source stems, transition events, ambience tracks, premaster, final WAV, and MP3. Sound effects should be added or removed by editing the manifest and rerendering, not by modifying dry source dialogue.\n\n## Episode Assets\n")
        workflow.write_text(workflow_text, encoding="utf-8")


def parse_episode_selection(value: str | None) -> set[int]:
    if not value:
        return {ep.number for ep in EPISODES}
    selected: set[int] = set()
    for part in value.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            start_text, end_text = part.split("-", 1)
            start = int(start_text)
            end = int(end_text)
            selected.update(range(start, end + 1))
        else:
            selected.add(int(part))
    known = {ep.number for ep in EPISODES}
    unknown = selected - known
    if unknown:
        raise SystemExit(f"unknown episode number(s): {', '.join(str(number) for number in sorted(unknown))}")
    return selected


def existing_episode_metadata(ep: Episode) -> tuple[int, str, str]:
    mp3 = AUDIO_DIR / f"{ep.slug}.mp3"
    if not mp3.exists():
        print(f"audio missing for episode {ep.number}; rendering {ep.title}", flush=True)
        return render_episode(ep)
    seconds = ffprobe_duration(mp3)
    rss_duration, page_duration = duration_text(seconds)
    return mp3.stat().st_size, rss_duration, page_duration


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Render The Turning Life podcast episodes and update site metadata.")
    parser.add_argument(
        "--episodes",
        help="Comma-separated episode numbers or ranges to render, for example '5' or '2,5'. Omit to render all episodes.",
    )
    parser.add_argument(
        "--voice-source",
        choices=("professional", "human", "tts"),
        default="professional",
        help="Use a professional voice provider for public masters, consented human WAV takes, or draft edge-tts synthetic voices for review only.",
    )
    parser.add_argument(
        "--voice-provider",
        choices=("openai", "elevenlabs"),
        default="openai",
        help="Professional voice provider to use when --voice-source professional is selected.",
    )
    parser.add_argument(
        "--voice-config",
        type=Path,
        help="Optional professional voice config JSON. Defaults to tools/professional_voice_config.json when present.",
    )
    parser.add_argument(
        "--allow-synthetic",
        action="store_true",
        help="Required with --voice-source tts because generated voices are draft placeholders, not human-quality public masters.",
    )
    args = parser.parse_args(argv)
    selected = parse_episode_selection(args.episodes)
    professional_config: dict[str, Any] | None = None
    if args.voice_source == "professional":
        professional_config = load_professional_voice_config(args.voice_config, args.voice_provider)
        validate_professional_voice_config(professional_config)
    if args.voice_source == "tts" and not args.allow_synthetic:
        raise SystemExit("Synthetic edge-tts voices are draft placeholders. Use --voice-source professional for public masters, or add --allow-synthetic for review-only renders.")

    MASTER_DIR.mkdir(parents=True, exist_ok=True)
    ensure_transition_assets()
    metadata: dict[int, tuple[int, str, str]] = {}
    for ep in EPISODES:
        if ep.number in selected:
            print(f"rendering episode {ep.number}: {ep.title}", flush=True)
            metadata[ep.number] = render_episode(ep, args.voice_source, professional_config)
        else:
            print(f"reading existing metadata for episode {ep.number}: {ep.title}", flush=True)
            metadata[ep.number] = existing_episode_metadata(ep)
    update_feed(metadata)
    update_html(metadata)
    update_docs()
    print("done", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
