import "./App.css";
import { useEffect, useState } from "react";
import { pwnedPassword } from "hibp";
import { GrPowerReset } from "react-icons/gr";
import { TiClipboard } from "react-icons/ti";
import stringEntropy from "fast-password-entropy";

// Functions for generating one random character for the password
function getRandomLower() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 97);
}
function getRandomUpper() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}
function getRandomNumber() {
  return String.fromCharCode(Math.floor(Math.random() * 10) + 48);
}
function getRandomSymbol() {
  const symbols = "#$%&@^`~.,:;\"'{}[]()<>*+!?=\\/|_-";
  return symbols[Math.floor(Math.random() * symbols.length)];
}
// Used to check for which of the options for generating a new password are turned on
const randomFunc: any = {
  randomLower: getRandomLower,
  randomUpper: getRandomUpper,
  randomNumber: getRandomNumber,
  randomSymbol: getRandomSymbol,
};
// Returns the strength of the password based on its complexity(bits) and its security(pwned)
const quality = (bits: number, pwned: number) => {
  if (pwned > 0 || bits <= 40) {
    return "Poor";
  } else if (bits <= 70) {
    return "Weak";
  } else if (bits <= 100) {
    return "Good";
  } else {
    return "Excellent";
  }
};

function App() {
  const [password, setPassword] = useState<string>("");
  const [pwned, setPwned] = useState<number>(0);
  const [passwordLength, setPasswordLength] = useState<number>(1);
  const [randomLower, setRandomLower] = useState<Boolean>(false);
  const [randomUpper, setRandomUpper] = useState<Boolean>(false);
  const [randomNumber, setRandomNumber] = useState<Boolean>(false);
  const [randomSymbol, setRandomSymbol] = useState<Boolean>(false);
  const [reset, setReset] = useState<Boolean>(false);
  // Generates a new password any time the options changes, the desired length changes or if the user just wants to run the password generator again
  useEffect(() => {
    function generatePassword() {
      // An emty string used to add random character into
      let generatedPassword: string = "";
      // Filters out the options that are checked for generating a password based on them
      const typesArr = [
        { randomUpper },
        { randomLower },
        { randomNumber },
        { randomSymbol },
      ].filter((item) => Object.values(item)[0]);
      // Just Checks for if all options are turned of and then sets the password to a empty string
      if (typesArr.length === 0) {
        setPassword(generatedPassword);
      } else {
        for (let i = 0; i < passwordLength; i++) {
          // Takes a random function to be used for adding a character to the pasword string
          const typeArr = [
            typesArr[Math.floor(Math.random() * typesArr.length)],
          ];
          // Just gets the name of the function
          const funcName: string = Object.keys(typeArr[0])[0];
          // Uses the function to generate a new character and adds it to the password
          generatedPassword += randomFunc[funcName]();
        }
        setPassword(generatedPassword);
      }
    }

    generatePassword();
  }, [
    passwordLength,
    randomUpper,
    randomLower,
    randomNumber,
    randomSymbol,
    reset,
  ]);
  // An API that returns the amount of times the password has been compromised in a leaked password database
  if (password !== null) {
    pwnedPassword(password)
      .then((numPwns) => {
        setPwned(numPwns);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  // Calculates the complexity of the password in bits
  const bits: number = stringEntropy(password);

  return (
    <div className="middle relative py-20 max-w-[80rem]">
      <div className="absolute px-8">
        <form className="input">
          <div className="py-1 text-lg max-sm:text-base font-medium">
            Password has been compromised<sup>1</sup>{" "}
            {pwned === 1 ? "1 time" : String(pwned) + " times"}
          </div>

          <div className="flex h-8">
            <div className="password-box relative flex-1 h-8 mr-2 border-1 bg-secondary border-primary border-solid rounded-sm">
              <input
                type="text"
                placeholder="password"
                className="password flex-1 w-full px-1 py-[3px] absolute bg-secondary focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div
              className="reset-box relative flex-none w-8 h-8 bg-secondary border-1 border-primary border-solid rounded-sm mr-2"
              onClick={() => setReset(!reset)}
            >
              <GrPowerReset className="center absolute w-4 h-auto" />
            </div>

            <div
              className="save-box relative flex-none w-8 h-8 bg-secondary border-1 border-primary border-solid rounded-sm"
              onClick={() => navigator.clipboard.writeText(password)}
            >
              <TiClipboard className="center absolute w-4 h-auto" />
            </div>
          </div>

          <div
            className={`border-0 rounded-md h-1 mt-2 ${
              quality(bits, pwned) === "Poor" ? "bg-red-600" : ""
            } ${quality(bits, pwned) === "Weak" ? "bg-orange-600" : ""} ${
              quality(bits, pwned) === "Good" ? "bg-lime-600" : ""
            } ${quality(bits, pwned) === "Excellent" ? "bg-green-600" : ""}`}
            style={{
              width: `${String(bits / 2) + "%"}`,
              maxWidth: "100%",
            }}
          ></div>

          <div className="py-2">
            <div className="inline-block text-lg max-sm:text-base font-medium">
              Password Quality: {quality(bits, pwned)}
            </div>
            <div className="inline-block text-lg max-sm:text-base float-right ">
              Entropy: {bits} bits<sup>2</sup>
            </div>
          </div>

          <div className="bg-secondary border-1 border-primary border-solid rounded-sm px-4 py-10 max-lg:py-6 mb-2">
            <div className="flex mb-10 max-lg:mb-6">
              <div className="slider-box flex-1 mr-2 relative">
                <input
                  type="range"
                  min="1"
                  max="128"
                  step="1"
                  value={`${passwordLength}`}
                  className="slider absolute w-full"
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                ></input>
              </div>

              <div className="flex-none border-1 border-primary border-solid rounded-sm">
                <input
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  value={`${passwordLength}`}
                  className="w-16 px-1 py-1 focus:outline-none"
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                ></input>
              </div>
            </div>

            <div className="relative">
              <div className="center flex absolute">
                <div
                  className={`mr-3 relative h-10 w-20 max-lg:h-8 max-lg:w-14 bg-third border-1 border-solid border-fourth rounded-sm ${
                    randomUpper ? "active" : "item-box"
                  }`}
                  onClick={() => setRandomUpper(!randomUpper)}
                >
                  <div className="center absolute text-xl max-lg:text-base">A-Z</div>
                </div>

                <div
                  className={`mr-3 relative h-10 w-20 max-lg:h-8 max-lg:w-14 bg-third border-1 border-solid border-fourth rounded-sm ${
                    randomLower ? "active" : "item-box"
                  }`}
                  onClick={() => setRandomLower(!randomLower)}
                >
                  <div className="center absolute text-xl max-lg:text-base">a-z</div>
                </div>

                <div
                  className={`mr-3 relative h-10 w-20 max-lg:h-8 max-lg:w-14 bg-third border-1 border-solid border-fourth rounded-sm ${
                    randomNumber ? "active" : "item-box"
                  }`}
                  onClick={() => setRandomNumber(!randomNumber)}
                >
                  <div className="center absolute text-xl max-lg:text-base">0-9</div>
                </div>

                <div
                  className={`relative h-10 w-20 max-lg:h-8 max-lg:w-14 bg-third border-1 border-solid border-fourth rounded-sm ${
                    randomSymbol ? "active" : "item-box"
                  }`}
                  onClick={() => setRandomSymbol(!randomSymbol)}
                >
                  <div className="center absolute text-xl max-lg:text-base">/*+&...</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-base max-lg:text-base">
            <p>1: Found in a breached and publicly leaked password database.</p>
            <p>
              2: The total number of possible combinations in bits, f({bits}) =
              2<sup>{bits}</sup>. E.g. the password "1234" has only numbers, so
              each position can have only 10 variations, 10<sup>4</sup> = 10000,
              to convert to bits we use the function log<sub>2</sub>(10000) =
              13,287... bits.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
