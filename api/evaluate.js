export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  const { 
    opponentClaim, 
    steelman, 
    critique, 
    critiqueWhy, 
    alternative, 
    alternativeWhy 
  } = req.body;

  const promptText = `You are a helpful, encouraging writing and logic coach evaluating a student's argument breakdown.

Use clear, simple language appropriate for a middle or high school reader. Avoid overly dense academic jargon (if you mention a logical fallacy, explain it simply without using Latin terms).

Analyze the student's six core reasoning inputs:
- Field 1 (Opponent's Claim): ${opponentClaim || ''}
- Field 2 (Steelman): ${steelman || ''}
- Field 3a (Flaw in Opponent's Claim): ${critique || ''}
- Field 3b (Why that flaw is a problem): ${critiqueWhy || ''}
- Field 4a (Alternative Solution): ${alternative || ''}
- Field 4b (Why alternative is better): ${alternativeWhy || ''}

You MUST follow this exact formatting structure for your response every single time:

### 1. Opponent's Claim & Steelman Check
* **Engagement:** [Is Field 2 a fair and strong representation of Field 1? Answer in 1-2 sentences.]
* **Feedback:** 
  - **What's working / What's wrong:** [Explain clearly]
  - **Why it matters:** [Explain why steelmanning fairly builds stronger arguments]
  - **How to fix it:** [Provide a concrete example of how to improve or polish it]

### 2. Critique & Logic Check (Fields 3a & 3b)
* **Direct Hit or Sidestep?:** [Does Field 3a directly address the point in Fields 1 & 2, or does it shift topics/commit a fallacy like a Strawman or Red Herring? Does Field 3b explain a REAL problem or consequence?]
* **Feedback:**
  - **What's working / What's wrong:** [Explain clearly]
  - **Why it matters:** [Explain why clearly proving WHY an opponent's flaw matters makes an argument convincing]
  - **How to fix it:** [Provide a concrete example or sample sentence showing how to directly connect the flaw to its real consequence]

### 3. Alternative Solution Check (Fields 4a & 4b)
* **Is it a Real Alternative?:** [Does Field 4a offer a constructive solution that fixes the problem in 3a/3b? Does 4b explain why it's truly superior?]
* **Feedback:**
  - **What's working / What's wrong:** [Explain clearly]
  - **Why it matters:** [Explain why proposing a practical, superior fix completes a strong counter-argument]
  - **How to fix it:** [Provide a concrete example of what a stronger alternative and explanation would look like]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server request failed: ' + err.message });
  }
}
