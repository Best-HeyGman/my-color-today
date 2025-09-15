document.addEventListener('DOMContentLoaded', () => {
    const firstNameInput = document.getElementById('firstName');
    const birthdayInput = document.getElementById('birthday');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const generateButton = document.getElementById('generate');
    const prophecyDiv = document.getElementById('prophecy');
    const hideProphecyCheckbox = document.getElementById('hideProphecy');

    // Load saved data from localStorage
    const savedFirstName = localStorage.getItem('firstName');
    const savedBirthday = localStorage.getItem('birthday');
    const savedHideProphecy = localStorage.getItem('hideProphecy');

    if (savedFirstName) {
        firstNameInput.value = savedFirstName;
    }
    if (savedBirthday) {
        birthdayInput.value = savedBirthday;
    }
    if (savedHideProphecy) {
        hideProphecyCheckbox.checked = true;
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

        if (hideProphecyCheckbox.checked) {
            localStorage.setItem('hideProphecy', 'true');
        } else {
            localStorage.removeItem('hideProphecy');
        }

        const hash = await generateHash(firstName, birthday, today);
        const colorCode = hash.substring(0, 6);
        const prophecyCode = hash.substring(0, 3);

        document.body.style.backgroundColor = `#${colorCode}`;
        updateTextColor(colorCode);

        if (!hideProphecyCheckbox.checked) {
            document.getElementById('prophecy').style.display = 'block';
            const prophecy = await fetchProphecy(prophecyCode);
            prophecyDiv.innerHTML = `<p>${prophecy}</p>`;
        } else {
            document.getElementById('prophecy').style.display = 'none';
        }
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
        const response = await fetch(`/prophecy/${code}`);
        const prophecyText = await response.text();
        return prophecyText;
    }

    function updateTextColor(colorCode) {
        const r = parseInt(colorCode.substring(0, 2), 16);
        const g = parseInt(colorCode.substring(2, 4), 16);
        const b = parseInt(colorCode.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const textColor = brightness > 128 ? 'black' : 'white';

        document.getElementById('inputContainer').style.color = textColor;
        document.querySelector('footer').style.color = textColor;
    }
});