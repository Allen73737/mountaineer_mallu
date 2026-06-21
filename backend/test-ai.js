import fetch from 'node-fetch'; // if needed, or just use native fetch if node 18+

const test = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/ai/story-draft', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Assuming it requires auth, we might need a token, but let's test the function directly instead
            },
            body: JSON.stringify({
                title: "My climb",
                region: "Alps",
                notes: "It was cold",
                language: "en"
            })
        });
        console.log(res.status);
        console.log(await res.text());
    } catch(e) {
        console.error(e);
    }
}
test();
