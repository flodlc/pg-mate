import { exec } from "child_process";

const options = process.argv.slice(2).reduce((acc, cur) => `${acc} ${cur}`, "");

const isEsm = process.argv.find((option) => option === "--esm");

const tsCommand = isEsm
  ? 'npx ts-node --esm --compilerOptions \'{"module": "ESNEXT"}\' src/pg-mate.ts'
  : 'npx ts-node --compilerOptions \'{"module": "CommonJS"}\' playground/pg-mate.ts';

exec(`${tsCommand} ${options}`, (error, stdout, stderr) => {
  if (error) {
    console.log(`${stdout}, ${error.message}`);
    return;
  }
  if (stderr) {
    console.log(`${stdout}, ${stderr}`);
    return;
  }
  console.log(`${stdout}`);
});
