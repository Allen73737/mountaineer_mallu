/**
 * Manglish → Malayalam Transliterator v2
 * 
 * A complete rewrite with proper syllable-based parsing.
 * 
 * Malayalam syllable structure: Consonant(+Conjuncts) + Vowel Sign
 * A bare consonant at word-end gets virama or chillu.
 * A consonant followed by 'a' has inherent /a/ (no sign needed).
 * 
 * The algorithm: scan left-to-right, greedily matching the longest
 * consonant cluster, then consume the following vowel. Between
 * consonants in a cluster, insert virama (്) to form conjuncts.
 */

const VIRAMA = '്';

// ─── Vowels (independent / word-initial forms) ────────────────────
// Sorted by length descending for greedy matching
const INDEPENDENT_VOWELS: [string, string][] = [
  ['ou', 'ഔ'], ['au', 'ഔ'],
  ['ai', 'ഐ'],
  ['aa', 'ആ'],
  ['ee', 'ഈ'], ['ii', 'ഈ'],
  ['oo', 'ഊ'], ['uu', 'ഊ'],
  ['ae', 'ഏ'],
  ['ei', 'ഏ'],
  ['a', 'അ'],
  ['i', 'ഇ'],
  ['u', 'ഉ'],
  ['e', 'എ'],
  ['o', 'ഒ'],
];

// ─── Vowel signs (dependent / after-consonant forms) ──────────────
const DEPENDENT_VOWELS: [string, string][] = [
  ['ou', 'ൗ'], ['au', 'ൗ'],
  ['ai', 'ൈ'],
  ['aa', 'ാ'],
  ['ee', 'ീ'], ['ii', 'ീ'],
  ['oo', 'ൂ'], ['uu', 'ൂ'],
  ['ae', 'േ'],
  ['ei', 'േ'],
  ['i', 'ി'],
  ['u', 'ു'],
  ['e', 'െ'],
  ['o', 'ൊ'],
  // 'a' after consonant = inherent vowel, handled specially
];

// ─── Consonants (sorted longest-first for greedy matching) ────────
const CONSONANTS: [string, string][] = [
  // 4+ letter clusters
  ['ntha', 'ന്ത'],  ['ndha', 'ന്ധ'],
  ['ngha', 'ങ്ഘ'],  ['ncha', 'ഞ്ച'],
  
  // 3 letter clusters
  ['tth', 'ത്ത'], ['cch', 'ച്ച'], ['tch', 'ച്ച'],
  ['ksh', 'ക്ഷ'], ['ksH', 'ക്ഷ'],
  ['shr', 'ശ്ര'], ['thr', 'ത്ര'],
  ['ndr', 'ന്ദ്ര'], ['nth', 'ന്ത'],
  ['nch', 'ഞ്ച'], ['njh', 'ഞ്ഝ'],
  ['mph', 'മ്ഫ'], ['mbh', 'മ്ഭ'],
  ['str', 'സ്ട്ര'],
  
  // 2 letter clusters — conjuncts
  ['kk', 'ക്ക'], ['gg', 'ഗ്ഗ'],
  ['ch', 'ച'],   ['cc', 'ച്ച'], ['jj', 'ജ്ജ'],
  ['tt', 'ട്ട'], ['dd', 'ഡ്ഡ'],
  ['nn', 'ന്ന'], ['NN', 'ണ്ണ'],
  ['pp', 'പ്പ'], ['bb', 'ബ്ബ'],
  ['mm', 'മ്മ'], ['yy', 'യ്യ'],
  ['ll', 'ല്ല'], ['LL', 'ള്ള'],
  ['vv', 'വ്വ'], ['ss', 'സ്സ'],
  ['rr', 'റ്റ'],  // rr → റ്റ (common in Manglish for "tta" sound)
  
  // 2 letter — nasal+stop
  ['ng', 'ങ്ങ'], ['nk', 'ങ്ക'],
  ['nj', 'ഞ്ഞ'],
  ['mp', 'മ്പ'], ['mb', 'മ്ബ'],
  ['nd', 'ന്ദ'], ['nt', 'ന്റ'],

  // 2 letter — aspirated
  ['kh', 'ഖ'], ['gh', 'ഘ'],
  ['jh', 'ഝ'],
  ['th', 'ത'], ['dh', 'ധ'],
  ['ph', 'ഫ'], ['bh', 'ഭ'],
  ['sh', 'ശ'], ['Sh', 'ഷ'],
  ['zh', 'ഴ'], ['nh', 'ഞ'],

  // Single consonants
  ['k', 'ക'], ['K', 'ക'],
  ['g', 'ഗ'], ['G', 'ഗ'],
  ['c', 'ക'],
  ['j', 'ജ'], ['J', 'ജ'],
  ['t', 'ട'], ['T', 'ട'],
  ['d', 'ഡ'], ['D', 'ഡ'],
  ['N', 'ണ'], ['n', 'ന'],
  ['p', 'പ'], ['P', 'പ'],
  ['b', 'ബ'], ['B', 'ബ'],
  ['m', 'മ'], ['M', 'മ'],
  ['y', 'യ'], ['Y', 'യ'],
  ['r', 'ര'], ['R', 'റ'],
  ['l', 'ല'], ['L', 'ള'],
  ['v', 'വ'], ['V', 'വ'],
  ['w', 'വ'], ['W', 'വ'],
  ['s', 'സ'], ['S', 'ഷ'],
  ['h', 'ഹ'], ['H', 'ഹ'],
  ['f', 'ഫ'], ['F', 'ഫ'],
  ['z', 'സ'], ['Z', 'സ'],
  ['x', 'ക്സ'],
  ['q', 'ക്ക'],
];

// ─── Chillu forms (word-final pure consonants) ────────────────────
const CHILLUS: Record<string, string> = {
  'ന': 'ൻ',
  'ല': 'ൽ',
  'ള': 'ൾ',
  'ണ': 'ൺ',
  'ര': 'ർ',
};

// ─── Common word overrides for highest accuracy ───────────────────
const OVERRIDES: Record<string, string> = {
  // Pronouns
  'njan': 'ഞാൻ', 'njaan': 'ഞാൻ', 'naan': 'ഞാൻ', 'njn': 'ഞാൻ',
  'nee': 'നീ', 'nii': 'നീ', 'ningal': 'നിങ്ങൾ', 'ningaL': 'നിങ്ങൾ',
  'thangal': 'താങ്കൾ', 'thankal': 'താങ്കൾ',
  'avan': 'അവൻ', 'aval': 'അവൾ', 'avar': 'അവർ', 'ath': 'അത്',
  'athu': 'അത്', 'ith': 'ഇത്', 'ithu': 'ഇത്',
  'nammal': 'നമ്മൾ', 'nammaL': 'നമ്മൾ',
  'njangal': 'ഞങ്ങൾ', 'njangaL': 'ഞങ്ങൾ',

  // Question words
  'enthu': 'എന്ത്', 'enthaa': 'എന്താ', 'entha': 'എന്ത',
  'enthaayi': 'എന്തായി', 'enth': 'എന്ത്', 'enthinu': 'എന്തിന്',
  'evide': 'എവിടെ', 'evideyaa': 'എവിടെയാ', 'evitta': 'എവിട്ട',
  'engane': 'എങ്ങനെ', 'engana': 'എങ്ങനെ',
  'eppol': 'എപ്പോൾ', 'eppo': 'എപ്പോ', 'eppozh': 'എപ്പോഴ്',
  'aaraa': 'ആരാ', 'aar': 'ആർ', 'aaru': 'ആര്',
  'ethre': 'എത്ര', 'ethra': 'എത്ര',

  // Common verbs / words
  'aanu': 'ആണ്', 'aaN': 'ആണ്', 'aan': 'ആൺ',
  'alla': 'അല്ല', 'allae': 'അല്ലേ', 'alle': 'അല്ലേ',
  'illa': 'ഇല്ല', 'ille': 'ഇല്ലേ', 'illallo': 'ഇല്ലല്ലോ',
  'undu': 'ഉണ്ട്', 'und': 'ഉണ്ട്', 'undo': 'ഉണ്ടോ',
  'venam': 'വേണം', 'veenam': 'വേണം', 'venda': 'വേണ്ട', 'vendaa': 'വേണ്ടാ',
  'poyii': 'പോയീ', 'poyi': 'പോയി', 'poo': 'പോ', 'pokam': 'പോകാം',
  'vaa': 'വാ', 'vaayo': 'വായോ', 'varum': 'വരും', 'vaamo': 'വരാമോ',
  'varu': 'വരൂ', 'varoo': 'വരൂ',
  'poda': 'പോടാ', 'podi': 'പോടി', 'podaa': 'പോടാ',
  'parayoo': 'പറയൂ', 'parayu': 'പറയൂ', 'paranju': 'പറഞ്ഞു', 'para': 'പറ',
  'cheyyoo': 'ചെയ്യൂ', 'cheythu': 'ചെയ്തു', 'cheytha': 'ചെയ്ത',
  'nokkoo': 'നോക്കൂ', 'nokku': 'നോക്കൂ', 'nokki': 'നോക്കി',
  'kanoo': 'കാണൂ', 'kando': 'കണ്ടോ', 'kandu': 'കണ്ട്',
  'thinnu': 'തിന്ന്', 'thinnoo': 'തിന്നൂ',
  'kodukk': 'കൊടുക്ക്', 'kodukku': 'കൊടുക്ക്',
  'edukkoo': 'എടുക്കൂ', 'edukku': 'എടുക്ക്',
  'irikku': 'ഇരിക്ക്', 'irikkoo': 'ഇരിക്കൂ',
  'nilkku': 'നിൽക്ക്', 'nilkkoo': 'നിൽക്കൂ',

  // Case markers
  'enne': 'എന്നെ', 'ennaal': 'എന്നാൽ', 'ennodu': 'എന്നോട്',
  'enikku': 'എനിക്ക്', 'enikk': 'എനിക്ക്',
  'ninakku': 'നിനക്ക്', 'ninakk': 'നിനക്ക്',
  'aarkku': 'ആർക്ക്', 'aark': 'ആർക്ക്',
  'avanu': 'അവന്', 'avalku': 'അവൾക്ക്',
  'athinu': 'അതിന്', 'athil': 'അതിൽ',

  // Conjunctions and particles
  'pinne': 'പിന്നെ', 'pinnae': 'പിന്നെ', 'pinneed': 'പിന്നീട്',
  'athae': 'അതെ', 'athe': 'അതെ', 'athey': 'അതെ',
  'angane': 'അങ്ങനെ', 'ingane': 'ഇങ്ങനെ',
  'pakshe': 'പക്ഷേ', 'pakshe': 'പക്ഷേ', 'pakshae': 'പക്ഷേ',
  'kaaranam': 'കാരണം', 'karanam': 'കാരണം',

  // Common nouns
  'mone': 'മോനെ', 'mon': 'മോൻ', 'mole': 'മോളെ', 'mol': 'മോൾ',
  'machan': 'മച്ചാൻ', 'machane': 'മച്ചാനെ',
  'chetta': 'ചേട്ടാ', 'chettan': 'ചേട്ടൻ', 'chechi': 'ചേച്ചി',
  'amma': 'അമ്മ', 'achan': 'അച്ഛൻ', 'achhan': 'അച്ഛൻ',
  'veedu': 'വീട്', 'veettil': 'വീട്ടിൽ',
  'naadu': 'നാട്', 'nattil': 'നാട്ടിൽ',
  'mala': 'മല', 'malai': 'മലൈ', 'kunnu': 'കുന്ന്',
  'kaadu': 'കാട്', 'kadal': 'കടൽ', 'puzha': 'പുഴ',
  'mazha': 'മഴ', 'veyil': 'വെയിൽ', 'kaattu': 'കാറ്റ്',
  'panam': 'പണം', 'samayam': 'സമയം', 'divasam': 'ദിവസം',

  // Adjectives / expressions
  'adipoli': 'അടിപൊളി', 'pwoli': 'പൊളി',
  'kollaam': 'കൊള്ളാം', 'kollam': 'കൊള്ളാം',
  'seri': 'ശരി', 'sheri': 'ശരി', 'shariyaa': 'ശരിയാ',
  'nannaayi': 'നന്നായി', 'nannayi': 'നന്നായി',
  'mathi': 'മതി', 'mathiyaayi': 'മതിയായി',
  'valare': 'വളരെ', 'valre': 'വളരെ',

  // Greetings
  'namaskaram': 'നമസ്കാരം', 'namaskar': 'നമസ്കാർ',
  'sugham': 'സുഖം', 'sughamano': 'സുഖമാണോ',
  'vishesham': 'വിശേഷം',

  // Time
  'ippo': 'ഇപ്പോ', 'ippol': 'ഇപ്പോൾ',
  'innu': 'ഇന്ന്', 'innale': 'ഇന്നലെ', 'naale': 'നാളെ',
  'raavile': 'രാവിലെ', 'vaikkunneram': 'വൈകുന്നേരം',
  'raathri': 'രാത്രി',

  // Numbers
  'onnu': 'ഒന്ന്', 'randu': 'രണ്ട്', 'moonu': 'മൂന്ന്',
  'naalu': 'നാല്', 'anchu': 'അഞ്ച്', 'aaru': 'ആറ്',
  'eezhu': 'ഏഴ്', 'ettu': 'എട്ട്', 'onpathu': 'ഒൻപത്',
  'pathu': 'പത്ത്', 'nooru': 'നൂറ്', 'aayiram': 'ആയിരം',
  'laksham': 'ലക്ഷം',

  // Place/culture
  'malayalam': 'മലയാളം', 'mallu': 'മല്ലു',
  'keralam': 'കേരളം', 'kerala': 'കേരള',
};

/**
 * Try to match a consonant cluster at position `i` in lowercase `text`.
 * Returns [malayalamConsonant, charsConsumed] or null.
 */
function matchConsonant(text: string, i: number): [string, number] | null {
  const remaining = text.substring(i);
  for (const [latin, mal] of CONSONANTS) {
    const lowerLatin = latin.toLowerCase();
    if (remaining.startsWith(lowerLatin) || remaining.startsWith(latin)) {
      return [mal, latin.length];
    }
  }
  return null;
}

/**
 * Try to match a vowel (independent) at position `i`.
 */
function matchIndependentVowel(text: string, i: number): [string, number] | null {
  const remaining = text.substring(i).toLowerCase();
  for (const [latin, mal] of INDEPENDENT_VOWELS) {
    if (remaining.startsWith(latin)) {
      return [mal, latin.length];
    }
  }
  return null;
}

/**
 * Try to match a dependent vowel sign at position `i`.
 */
function matchDependentVowel(text: string, i: number): [string, number] | null {
  const remaining = text.substring(i).toLowerCase();
  for (const [latin, mal] of DEPENDENT_VOWELS) {
    if (remaining.startsWith(latin)) {
      return [mal, latin.length];
    }
  }
  return null;
}

/**
 * Check if char at position is a consonant start.
 */
function isConsonantStart(text: string, i: number): boolean {
  return matchConsonant(text, i) !== null;
}

/**
 * Convert a single Manglish word to Malayalam.
 * 
 * Algorithm:
 * 1. At each position, try to read a consonant.
 * 2. If consonant found, check if followed by another consonant → insert virama (conjunct).
 * 3. After final consonant in cluster, read the vowel sign.
 * 4. If no consonant, read an independent vowel.
 * 5. Handle 'a' after consonant as inherent vowel (no sign) or 'aa' as ാ.
 */
function transliterateWord(word: string): string {
  const lower = word.toLowerCase();
  
  // Check overrides
  if (OVERRIDES[lower]) return OVERRIDES[lower];
  
  let result = '';
  let i = 0;

  while (i < lower.length) {
    // Try consonant
    const cMatch = matchConsonant(lower, i);
    
    if (cMatch) {
      const [consonant, cLen] = cMatch;
      result += consonant;
      i += cLen;
      
      // Now check what follows:
      // Case 1: Another consonant directly follows → virama + next consonant (conjunct)
      //         But first check if there's an 'a' that's just the inherent vowel
      // Case 2: A vowel sign follows
      // Case 3: End of word → add virama or chillu
      
      // Check for vowel
      if (i < lower.length) {
        // Check dependent vowel (non-'a')
        const vMatch = matchDependentVowel(lower, i);
        if (vMatch) {
          result += vMatch[0];
          i += vMatch[1];
          continue;
        }
        
        // Check 'a' — inherent vowel
        if (lower[i] === 'a') {
          // 'aa' → long ā sign
          if (i + 1 < lower.length && lower[i + 1] === 'a') {
            result += 'ാ';
            i += 2;
            continue;
          }
          // Single 'a' followed by consonant or end → inherent, just skip
          // But 'a' at word end is also inherent, skip it
          i += 1;
          continue;
        }
        
        // Next is another consonant → this consonant gets virama (conjunct will form)
        if (isConsonantStart(lower, i)) {
          result += VIRAMA;
          continue; // loop back to read next consonant
        }
        
        // Not a vowel, not a consonant — end syllable with virama
        const lastChar = result[result.length - 1];
        if (CHILLUS[lastChar]) {
          result = result.slice(0, -1) + CHILLUS[lastChar];
        } else {
          result += VIRAMA;
        }
        // Pass the character through
        result += lower[i];
        i++;
      } else {
        // End of word — consonant with no vowel
        const lastChar = result[result.length - 1];
        if (CHILLUS[lastChar]) {
          result = result.slice(0, -1) + CHILLUS[lastChar];
        } else {
          result += VIRAMA;
        }
      }
    } else {
      // Try independent vowel
      const vMatch = matchIndependentVowel(lower, i);
      if (vMatch) {
        result += vMatch[0];
        i += vMatch[1];
      } else {
        // Unknown character — pass through
        result += word[i];
        i++;
      }
    }
  }

  return result;
}

/**
 * Main entry: transliterate a full Manglish string to Malayalam.
 * Preserves spaces, punctuation, numbers, and existing Malayalam text.
 */
export function manglishToMalayalam(input: string): string {
  // Split into tokens: words (Latin alpha) vs everything else
  const tokens = input.split(/([a-zA-Z]+)/);
  
  return tokens.map(token => {
    if (/^[a-zA-Z]+$/.test(token)) {
      return transliterateWord(token);
    }
    return token;
  }).join('');
}
