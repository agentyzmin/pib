const input = document.getElementById('input');
const output = document.getElementById('output');
const caseSelect = document.getElementById('case');
const toggleWarning = document.getElementById('toggleWarning');

input.addEventListener('keyup', update);
caseSelect.addEventListener('change', update);
toggleWarning.addEventListener('change', update);
update();

function formatResult(result, delimiter, genderIsNotDetected) {
  delimiter = delimiter || ' ';
  const showWarning = !toggleWarning.checked;
  return [
    (genderIsNotDetected && showWarning) ? '⚠️' : '',
    result.familyName || '',
    result.givenName || '',
    result.patronymicName || ''
  ]
    .filter(Boolean)
    .join(delimiter) + '\n';
}


async function update() {
  const text = input.value;
  const lines = text.split('\n');
  const selectedCase = caseSelect.value;

  console.log(selectedCase);
  let outputText = '';


  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
        if (line.trim() === '') {
          outputText += '\n';
          continue;
      }


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
    outputText += formatResult(result, delimiter, genderIsNotDetected);
  }
  output.value = outputText;
}


document.getElementById('formatButton').addEventListener('click', formatNames);

function formatNames() {
  const text = input.value.trim();
  if (text === '') return;

  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    const names = line.split(/\s+/);
    if (names.length < 2) {
      return line; // Return the line as is if it doesn't have at least two parts
    }

    const givenName = names[1].charAt(0).toUpperCase() + names[1].slice(1).toLowerCase();
    const familyName = names[0].toUpperCase();
    return `${givenName} ${familyName}`;
  });

  input.value = formattedLines.join('\n');
  update();
}