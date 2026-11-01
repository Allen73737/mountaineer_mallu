// The on-screen keyboard (react-simple-keyboard, ~110 kB with its styles) only loads when a visitor
// actually opens it from a LanguageInput, instead of shipping with every page that has a text field.
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

export default Keyboard;
