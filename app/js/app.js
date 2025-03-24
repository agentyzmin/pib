import * as shevchenko from 'shevchenko';
import { militaryExtension } from 'shevchenko-ext-military';

// Initialize shevchenko with military extension
shevchenko.registerExtension(militaryExtension);

const input = document.getElementById('input');
const output = document.getElementById('output');
const caseSelect = document.getElementById('case');
const toggleWarning = document.getElementById('toggleWarning');

input.addEventListener('keyup', update);
caseSelect.addEventListener('change', update);
toggleWarning.addEventListener('change', update);
update();

// Add this after shevchenko is initialized
const shevchenkoVersion = shevchenko.VERSION || '3.1.4'; // Fallback version if VERSION not available
document.getElementById('shevchenkoVersion').textContent = `(v${shevchenkoVersion})`;

function formatResult(result, delimiter, genderIsNotDetected) {
  delimiter = delimiter || ' ';
  const showWarning = !toggleWarning.checked;
  return [
    (genderIsNotDetected && showWarning) ? '⚠️' : '',
    result.familyName || '',
    result.givenName || '',
    result.patronymicName || '',
    result.militaryAppointment || ''
  ]
    .filter(Boolean)
    .join(delimiter) + '\n';
}

function parseInputLine(line) {
  const parts = line.split(/\s+/);
  const delimiter = line.match(/\s+/);
  
  // Check if there's a military appointment (usually comes after the name)
  let militaryAppointment = '';
  let nameParts = [...parts];
  
  // Look for military appointment indicators
  const militaryIndicators = {
    ranks: [
      'генерал', 'полковник', 'підполковник', 'майор', 'капітан', 
      'старший лейтенант', 'лейтенант', 'молодший лейтенант', 
      'старший прапорщик', 'прапорщик', 'старший сержант', 
      'сержант', 'молодший сержант', 'старший солдат', 'солдат'
    ],
    positions: [
      'помічник', 'старший', 'молодший', 'головний', 'заступник', 
      'начальник', 'командир', 'завідувач', 'керівник', 'інспектор',
      'оператор', 'спеціаліст', 'експерт', 'аналітик', 'радник'
    ],
    units: [
      'бригада', 'батальйон', 'рота', 'взвод', 'відділ', 'група',
      'служба', 'управління', 'штаб', 'центр', 'полк', 'дивизія'
    ]
  };

  // Function to check if a word starts with any of the military indicators
  const isMilitaryIndicator = (word) => {
    word = word.toLowerCase();
    return Object.values(militaryIndicators).some(category => 
      category.some(indicator => word.startsWith(indicator))
    );
  };

  // Find the military appointment in the name
  for (let i = 3; i < parts.length; i++) {
    if (isMilitaryIndicator(parts[i])) {
      militaryAppointment = parts.slice(i).join(' ');
      nameParts = parts.slice(0, i);
      break;
    }
  }

  const [familyName, givenName, patronymicName] = nameParts;
  return {
    familyName,
    givenName,
    patronymicName,
    militaryAppointment,
    delimiter
  };
}

async function update() {
  const text = input.value;
  const lines = text.split('\n');
  const selectedCase = caseSelect.value;
  let outputText = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') {
      outputText += '\n';
      continue;
    }

    const { familyName, givenName, patronymicName, militaryAppointment, delimiter } = parseInputLine(line);

    let gender = await shevchenko.detectGender({
      givenName, patronymicName, familyName
    });
    const genderIsNotDetected = gender === null;
    if (!gender) {
      gender = shevchenko.GrammaticalGender.MASCULINE;
    }

    let result;
    try {
      switch (selectedCase) {
        case 'nominative':
          result = await shevchenko.inNominative({ gender, givenName, patronymicName, familyName, militaryAppointment });
          break;
        case 'genitive':
          result = await shevchenko.inGenitive({ gender, givenName, patronymicName, familyName, militaryAppointment });
          break;
        case 'dative':
          result = await shevchenko.inDative({ gender, givenName, patronymicName, familyName, militaryAppointment });
          break;
        case 'accusative':
          result = await shevchenko.inAccusative({ gender, givenName, patronymicName, familyName, militaryAppointment });
          break;
        case 'ablative':
          result = await shevchenko.inAblative({ gender, givenName, patronymicName, familyName, militaryAppointment });
          break;
        case 'locative':
          result = await shevchenko.inLocative({ gender, givenName, patronymicName, familyName, militaryAppointment });
          break;
        case 'vocative':
          result = await shevchenko.inVocative({ gender, givenName, patronymicName, familyName, militaryAppointment });
          break;
      }
    } catch (error) {
      console.error('Error declining name:', error);
      result = { familyName, givenName, patronymicName, militaryAppointment };
    }

    outputText += formatResult(result, delimiter, genderIsNotDetected);
  }
  output.value = outputText;
}

async function formatFamilyNameOnly() {
  const text = input.value.trim();
  if (text === '') return;

  const lines = text.split('\n');
  const formattedLines = await Promise.all(lines.map(async line => {
    if (!line.trim()) return line;

    // Split the line while preserving the original delimiter
    const delimiter = line.match(/\s+/);
    const parts = line.split(/\s+/);
    
    // Try to detect the family name using shevchenko's gender detection
    const possibleFamilyNames = await Promise.all(parts.map(async (word, index) => {
      const otherParts = parts.filter((_, i) => i !== index);
      const gender = await shevchenko.detectGender({
        familyName: word,
        givenName: otherParts[0] || '',
        patronymicName: otherParts[1] || ''
      });
      
      return {
        word,
        index,
        isFamilyName: gender !== null
      };
    }));

    // Find the first detected family name
    const familyName = possibleFamilyNames.find(name => name.isFamilyName);
    
    if (familyName) {
      // Convert only the detected family name to uppercase
      parts[familyName.index] = familyName.word.toUpperCase();
    }
    
    // Join the parts back together with the original delimiter
    return parts.join(delimiter || ' ');
  }));

  input.value = formattedLines.join('\n');
  update();
}

function formatNameAndFamily() {
  const text = input.value.trim();
  if (text === '') return;

  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    const { familyName, givenName, patronymicName, militaryAppointment } = parseInputLine(line);
    if (!givenName || !familyName) {
      return line;
    }

    const formattedGivenName = givenName.charAt(0).toUpperCase() + givenName.slice(1).toLowerCase();
    const formattedFamilyName = familyName.toUpperCase();
    
    return [
      formattedGivenName,
      formattedFamilyName,
      militaryAppointment
    ].filter(Boolean).join(' ');
  });

  input.value = formattedLines.join('\n');
  update();
}

function formatFullName() {
  const text = input.value.trim();
  if (text === '') return;

  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    const { familyName, givenName, patronymicName, militaryAppointment } = parseInputLine(line);
    if (!givenName || !familyName) {
      return line;
    }

    const formattedGivenName = givenName.charAt(0).toUpperCase() + givenName.slice(1).toLowerCase();
    const formattedPatronymicName = patronymicName ? patronymicName.charAt(0).toUpperCase() + patronymicName.slice(1).toLowerCase() : '';
    const formattedFamilyName = familyName.toUpperCase();
    
    return [
      formattedGivenName,
      formattedPatronymicName,
      formattedFamilyName,
      militaryAppointment
    ].filter(Boolean).join(' ');
  });

  input.value = formattedLines.join('\n');
  update();
}

function formatInitialAndFamily() {
  const text = input.value.trim();
  if (text === '') return;

  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    const { familyName, givenName, patronymicName, militaryAppointment } = parseInputLine(line);
    if (!givenName || !familyName) {
      return line;
    }

    const formattedGivenName = givenName.charAt(0).toUpperCase() + '.';
    const formattedFamilyName = familyName.toUpperCase();
    
    return [
      formattedGivenName,
      formattedFamilyName,
      militaryAppointment
    ].filter(Boolean).join(' ');
  });

  input.value = formattedLines.join('\n');
  update();
}

// Add event listeners for the new format buttons
document.getElementById('formatFamilyNameOnly').addEventListener('click', formatFamilyNameOnly);
document.getElementById('formatNameAndFamily').addEventListener('click', formatNameAndFamily);
document.getElementById('formatFullName').addEventListener('click', formatFullName);
document.getElementById('formatInitialAndFamily').addEventListener('click', formatInitialAndFamily);