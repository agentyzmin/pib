const input = document.getElementById('input');
const outputNominative = document.getElementById('outputNominative');
const outputGenitive = document.getElementById('outputGenitive');
const outputDative = document.getElementById('outputDative');
const outputAccusative = document.getElementById('outputAccusative');
const outputAblative = document.getElementById('outputAblative');
const outputLocative = document.getElementById('outputLocative');
const outputVocative = document.getElementById('outputVocative');

input.addEventListener('keyup', updateAll);
updateAll();

function formatResult(result, delimiter, genderIsNotDetected) {
  delimiter = delimiter || ' ';
  return [
    genderIsNotDetected ? '⚠️' : '',
    result.familyName || '',
    result.givenName || '',
    result.patronymicName || ''
  ]
    .filter(Boolean)
    .join(delimiter) + '\n';
}

async function updateAll() {
  const text = input.value;
  const lines = text.split('\n');

  const outputText = {
    // nominative: '',
    genitive: '',
    dative: '',
    accusative: '',
    ablative: '',
    locative: '',
    vocative: '',
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      for (let key in outputText) {
        outputText[key] += '\n';
      }
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

    // {
    //   const result = await shevchenko.inNominative({gender, givenName, patronymicName, familyName});
    //   outputText.nominative += formatResult(result, delimiter, genderIsNotDetected);
    // }

    {
      const result = await shevchenko.inGenitive({gender, givenName, patronymicName, familyName});
      outputText.genitive += formatResult(result, delimiter, genderIsNotDetected);
    }

    {
      const result = await shevchenko.inDative({gender, givenName, patronymicName, familyName});
      outputText.dative += formatResult(result, delimiter, genderIsNotDetected);
    }

    {
      const result = await shevchenko.inAccusative({gender, givenName, patronymicName, familyName});
      outputText.accusative += formatResult(result, delimiter, genderIsNotDetected);
    }

    {
      const result = await shevchenko.inAblative({gender, givenName, patronymicName, familyName});
      outputText.ablative += formatResult(result, delimiter, genderIsNotDetected);
    }

    {
      const result = await shevchenko.inLocative({gender, givenName, patronymicName, familyName});
      outputText.locative += formatResult(result, delimiter, genderIsNotDetected);
    }

    {
      const result = await shevchenko.inVocative({gender, givenName, patronymicName, familyName});
      outputText.vocative += formatResult(result, delimiter, genderIsNotDetected);
    }
  }

  // outputNominative.value = outputText.nominative;
  outputGenitive.value = outputText.genitive;
  outputDative.value = outputText.dative;
  outputAccusative.value = outputText.accusative;
  outputAblative.value = outputText.ablative;
  outputLocative.value = outputText.locative;
  outputVocative.value = outputText.vocative;
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
  updateAll();
}
