const startButton = document.querySelector('#start-crawling');

startButton.addEventListener('click', async () => {
    const url = document.querySelector('#url').value;
    const maxDepth = document.querySelector('#max-depth').value;
    const maxPages = document.querySelector('#max-pages').value;

    try {
        await fetch('/users/login', {
            method: 'POST',
            body: JSON.stringify({ url, maxDepth, maxPages }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();

        if (data.errors) {
            emailError.textContent = data.errors.email;
            passwordError.textContent = data.errors.password;
        } else {
            document.querySelector('.login-container').style.display = 'none';
            location.reload();
        }
    } catch (e) {
        console.log("login error:", e);
    }

})