# Quote Flow Test Scenarios

## Scenario 1: Warm Intro Only
**User:** "Hi! I love your photography style"
**Expected Bot:** Warm, on-brand reply in creator's voice
**Action:** WARM_REPLY
**Example:** "Hey hey! So pumped you reached out! Love that you dig the style ✨"

## Scenario 2: Clarify → Quote Mini
**User:** "Price for 2-hr couples shoot?"
**Expected Bot:** Ask for missing details (date, location)
**Action:** ASK
**Example:** "Love this idea! Just need a couple details:\n• What date are you thinking?\n• Where would you like to shoot?"

**User:** "June 15th, Central Park"
**Expected Bot:** Quote Standard package (since 2 hours > 1 hour)
**Action:** QUOTE_REQUEST → Standard package
**Example:** "Here's what that would look like:\n\n• Standard (60 min): $300\n• 1 extra hour(s): $250\n\nTotal: $550\n\nNo rush — happy to answer Qs!"

## Scenario 3: Wedding Ask → Extra Hours + Second Shooter + Travel
**User:** "Wedding photography for 6 hours with second shooter, venue is 40 miles away"
**Expected Bot:** Quote wedding_base with addons and travel fee
**Action:** QUOTE_REQUEST → wedding_base, 6 hours, second_shooter, 40 miles
**Example:** "Here's what that would look like:\n\n• Wedding Base (4 hrs): $1200\n• 2 extra hour(s): $500\n• Second shooter: $300\n• Travel fee: $30\n\nTotal: $2030\n\nNo rush — happy to answer Qs!"

## Scenario 4: Booking Link Request
**User:** "Can I book?"
**Expected Bot:** Provide booking URL
**Action:** BOOKING
**Example:** "You can grab a time here 👉 https://calendly.com/creator/30min"

## Scenario 5: Custom Weird Ask → Human Handoff
**User:** "I need a 3-day corporate event with drone footage and live streaming"
**Expected Bot:** Handoff to human
**Action:** HUMAN
**Example:** "Flagging this for me to answer personally — I'll be right with you! 🙌"
**Slack Notification:** Sent with user details and reason

## Edge Cases

### Empty Message
**User:** (sends empty message or non-text)
**Expected Bot:** Ignore, no response

### Distance Unknown
**User:** "Wedding photography, 6 hours"
**Expected Bot:** Quote without travel fee, mention travel fee applies beyond 25 miles
**Example:** "Here's what that would look like:\n\n• Wedding Base (4 hrs): $1200\n• 2 extra hour(s): $500\n\nTotal: $1700\n\nTravel fee applies beyond 25 miles; happy to confirm once I have the address!"

### Repeat Price Ask
**User:** "What about the price again?"
**Expected Bot:** Vary response slightly, offer booking link
**Example:** "Sure thing! Here's the breakdown again:\n\n• Standard (60 min): $300\n\nTotal: $300\n\nReady to book? You can grab a time here 👉 https://calendly.com/creator/30min"
