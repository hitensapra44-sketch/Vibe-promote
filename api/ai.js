export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { feature, ...body } = req.body;

  // Route to correct key and model based on feature
  let primaryKey, model, fallbackModel;

  fallbackModel = 'nvidia/nemotron-mini-4b-instruct';
  const fallbackKey = process.env.NVIDIA_KEY_FALLBACK;

  if (feature === 'onboarding') {
    primaryKey = process.env.NVIDIA_KEY_ONBOARDING;
    model = 'minimax/minimax-m2.7';
  } else if (['post', 'copilot', 'analytics'].includes(feature)) {
    primaryKey = process.env.NVIDIA_KEY_POST;
    model = 'mistralai/mistral-large-3-675b-instruct-2512';
  } else if (feature === 'userfinder') {
    primaryKey = process.env.NVIDIA_KEY_USERFINDER;
    model = 'mistralai/mistral-large-3-675b-instruct-2512';
  } else {
    primaryKey = fallbackKey;
    model = fallbackModel;
  }

  const payload = { ...body, model };

  const tryCall = async (apiKey, modelOverride) => {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ ...payload, model: modelOverride }),
    });
    return response;
  };

  try {
    let response = await tryCall(primaryKey, model);

    // If primary key fails with quota/server error, try fallback key + fallback model
    if (response.status === 429 || response.status === 500 || response.status === 503) {
      console.warn(`Primary key failed with ${response.status} for feature "${feature}". Trying fallback.`);
      response = await tryCall(fallbackKey, fallbackModel);
    }

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    // Network error on primary — try fallback
    try {
      console.warn(`Primary key threw error for feature "${feature}". Trying fallback.`);
      const fallbackResponse = await tryCall(fallbackKey, fallbackModel);
      const data = await fallbackResponse.json();
      return res.status(fallbackResponse.status).json(data);
    } catch (fallbackErr) {
      return res.status(500).json({ error: fallbackErr.message });
    }
  }
}