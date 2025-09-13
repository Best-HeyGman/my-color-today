document.addEventListener('DOMContentLoaded', () => {
    const firstNameInput = document.getElementById('firstName');
    const birthdayInput = document.getElementById('birthday');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const generateButton = document.getElementById('generate');
    const prophecyDiv = document.getElementById('prophecy');

    // Load saved data from localStorage
    const savedFirstName = localStorage.getItem('firstName');
    const savedBirthday = localStorage.getItem('birthday');

    if (savedFirstName) {
        firstNameInput.value = savedFirstName;
    }
    if (savedBirthday) {
        birthdayInput.value = savedBirthday;
    }

    generateButton.addEventListener('click', async () => {
        const firstName = firstNameInput.value;
        const birthday = birthdayInput.value;
        const today = new Date().toLocaleDateString();

        if (rememberMeCheckbox.checked) {
            localStorage.setItem('firstName', firstName);
            localStorage.setItem('birthday', birthday);
        } else {
            localStorage.removeItem('firstName');
            localStorage.removeItem('birthday');
        }

        const hash = await generateHash(firstName, birthday, today);
        const colorCode = hash.substring(0, 6);
        const prophecyCode = hash.substring(0, 3);

        document.body.style.backgroundColor = `#${colorCode}`;

        const prophecy = await fetchProphecy(prophecyCode);
        prophecyDiv.innerHTML = `<p>${prophecy}</p>`;
    });

    async function generateHash(firstName, birthday, today) {
        const encoder = new TextEncoder();
        const data = encoder.encode(`${firstName}${birthday}${today}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async function fetchProphecy(code) {
        const response = await fetch(`www.my-color.today/prophecy/${code}`);
        const prophecyText = await response.text();
        return prophecyText;
    }
});