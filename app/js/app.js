const input = document.getElementById('input');
const output = document.getElementById('output');
const caseSelect = document.getElementById('case');

input.addEventListener('keyup', update);
caseSelect.addEventListener('change', update);
update();

async function update() {
  const text = input.value;
  const lines = text.split('\n');
  const selectedCase = caseSelect.value;

  console.log(selectedCase);
  let outputText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const [familyName, givenName, patronymicName] = line.split(/\s+/);
    const delimiter = line.match(/\s+/);

    let gender = await shevchenko.detectGender({
      givenName, patronymicName, familyName
    });
    const genderIsNotDetected = gender === null;
    if (!gender) {
      gender = 'masculine';
    }

    let result;
    switch (selectedCase) {
      case 'nominative':
        result = await shevchenko.inNominative({gender, givenName, patronymicName, familyName});
        break;

      case 'genitive':
        result = await shevchenko.inGenitive({gender, givenName, patronymicName, familyName});
        break;

      case 'dative':
        result = await shevchenko.inDative({gender, givenName, patronymicName, familyName});
        break;

      case 'accusative':
        result = await shevchenko.inAccusative({gender, givenName, patronymicName, familyName});
        break;

      case 'ablative':
        result = await shevchenko.inAblative({gender, givenName, patronymicName, familyName});
        break;

      case 'locative':
        result = await shevchenko.inLocative({gender, givenName, patronymicName, familyName});
        break;

      case 'vocative':
        result = await shevchenko.inVocative({gender, givenName, patronymicName, familyName});
        break;
    }
    outputText += `${genderIsNotDetected ? '⚠️' : ''}${result.familyName}${delimiter}${result.givenName}${delimiter}${result.patronymicName}  \n`;
  }
  output.value = outputText;
}