import fetch from 'node-fetch';

const test = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: 'hello' }]
            })
        });
        console.log(res.status);
        const text = await res.text();
        console.log(text);
    } catch(e) {
        console.error('Fetch error:', e);
    }
};
test();
