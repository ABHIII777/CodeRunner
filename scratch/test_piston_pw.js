async function testPistonPW() {
  const content = 'print("Hello from Piston PW!")';
  const language = 'python';
  const version = '3.10.0';

  try {
    const res = await fetch("https://piston.piston.pw/api/v2/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version,
        files: [{ content }]
      })
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testPistonPW();
