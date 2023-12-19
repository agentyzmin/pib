const outputNominative = document.getElementById('outputNominative');
const outputGenitive = document.getElementById('outputGenitive');
const outputDative = document.getElementById('outputDative');
const outputAccusative = document.getElementById('outputAccusative');
const outputAblative = document.getElementById('outputAblative');
const outputLocative = document.getElementById('outputLocative');
const outputVocative = document.getElementById('outputVocative');

input.addEventListener('keyup', updateAll);
updateAll();

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
    //   outputText.nominative += `${genderIsNotDetected ? '⚠️' : ''}${result.familyName}${delimiter}${result.givenName}${delimiter}${result.patronymicName}\n`;
    // }

    {
      const result = await shevchenko.inGenitive({gender, givenName, patronymicName, familyName});
      outputText.genitive += `${genderIsNotDetected ? '⚠️' : ''}${result.familyName}${delimiter}${result.givenName}${delimiter}${result.patronymicName}\n`;
    }

    {
      const result = await shevchenko.inDative({gender, givenName, patronymicName, familyName});
      outputText.dative += `${genderIsNotDetected ? '⚠️' : ''}${result.familyName}${delimiter}${result.givenName}${delimiter}${result.patronymicName}\n`;
    }

    {
      const result = await shevchenko.inAccusative({gender, givenName, patronymicName, familyName});
      outputText.accusative += `${genderIsNotDetected ? '⚠️' : ''}${result.familyName}${delimiter}${result.givenName}${delimiter}${result.patronymicName}\n`;
    }

    {
      const result = await shevchenko.inAblative({gender, givenName, patronymicName, familyName});
      outputText.ablative += `${genderIsNotDetected ? '⚠️' : ''}${result.familyName}${delimiter}${result.givenName}${delimiter}${result.patronymicName}\n`;
    }

    {
      const result = await shevchenko.inLocative({gender, givenName, patronymicName, familyName});
      outputText.locative += `${genderIsNotDetected ? '⚠️' : ''}${result.familyName}${delimiter}${result.givenName}${delimiter}${result.patronymicName}\n`;
    }

    {
      const result = await shevchenko.inVocative({gender, givenName, patronymicName, familyName});
      outputText.vocative += `${genderIsNotDetected ? '⚠️' : ''}${result.familyName}${delimiter}${result.givenName}${delimiter}${result.patronymicName}\n`;
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