async function testCodeX() {
  const code = 'print("Hello from CodeX!")';
  const language = 'py';

  try {
    const res = await fetch("https://api.codex.jaagrav.in", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        language,
        code
      })
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testCodeX();
