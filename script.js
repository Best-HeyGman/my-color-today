document.addEventListener('DOMContentLoaded', () => {
    const firstNameInput = document.getElementById('firstName');
    const birthdayInput = document.getElementById('birthday');
    const generateButton = document.getElementById('generate');
    const anotherDayCheckbox = document.getElementById('anotherDayCheckbox');
    const anotherDayInput = document.getElementById('anotherDay');
    const anotherDayContainer = document.getElementById('anotherDayContainer');

    // Load saved data from localStorage
    const savedFirstName = localStorage.getItem('firstName');
    const savedBirthday = localStorage.getItem('birthday');

    anotherDayCheckbox.checked = false;

    if (savedFirstName) {
        firstNameInput.value = savedFirstName;
    }
    if (savedBirthday) {
        birthdayInput.value = savedBirthday;
    }

    anotherDayCheckbox.addEventListener('change', async () => {
        if (anotherDayCheckbox.checked) {
            anotherDayContainer.style.display = 'inline-block';
        } else {
            anotherDayContainer.style.display = 'none';
        }
    });

    generateButton.addEventListener('click', async () => {
        const firstName = firstNameInput.value;
        const birthday = birthdayInput.value;
        let today;
        if (anotherDayCheckbox.checked) {
            today = anotherDayInput.value;
        } else {
            today = new Date().toISOString().substring(0, 10);
        }

        localStorage.setItem('firstName', firstName);
        localStorage.setItem('birthday', birthday);

        const hash = await generateHash(firstName, birthday, today);
        const colorCode = hash.substring(0, 6);

        document.body.style.backgroundColor = `#${colorCode}`;
        updateTextColor(colorCode);
    });

    async function generateHash(firstName, birthday, today) {
        const encoder = new TextEncoder();
        const data = encoder.encode(`${firstName}${birthday}${today}`);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
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