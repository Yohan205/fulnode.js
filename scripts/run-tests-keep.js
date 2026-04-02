const fs = require("fs");
const path = require("path");
const {
  encryptString,
  decryptString,
  encryptFile,
  decryptFile,
} = require("../dist");

async function main() {
  const secret = "keep-test-secret";
  console.log("--- STRING TEST ---");
  const original = "Conservar archivos de prueba - texto";
  try {
    const enc = await encryptString(original, secret);
    console.log("Encrypted header (first line):", enc.split("\n")[0]);
    const dec = await decryptString(enc, secret);
    console.log("Decrypted equals original:", dec === original);
    fs.writeFileSync(
      path.join(__dirname, "..", "tmp_test", "string.enc.txt"),
      enc,
      "utf8",
    );
  } catch (e) {
    console.error("String test failed:", e && e.message);
  }

  console.log("\n--- FILE TEST ---");
  const tmp = path.join(__dirname, "..", "tmp_test");
  try {
    if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
  } catch (e) {}
  const inFile = path.join(tmp, "keep-in.bin");
  const encFile = path.join(tmp, "keep-in.bin.myec");
  const decFile = path.join(tmp, "keep-in.dec.bin");
  fs.writeFileSync(
    inFile,
    Buffer.from("Linea conservar\n".repeat(2000), "utf8"),
  );
  console.log("Input size bytes:", fs.statSync(inFile).size);
  try {
    await encryptFile(inFile, encFile, secret);
    console.log("Encrypted file written:", encFile);
    const headerLine = fs
      .readFileSync(encFile, { encoding: "utf8", flag: "r" })
      .split("\n")[0];
    console.log("Encrypted file header line:", headerLine);
    await decryptFile(encFile, decFile, secret);
    console.log("Decrypted file written:", decFile);
    const a = fs.readFileSync(inFile);
    const b = fs.readFileSync(decFile);
    console.log("Files equal:", a.equals(b));
  } catch (e) {
    console.error("File test failed:", e && e.message);
  }

  console.log("\nArtifacts kept in tmp_test/");
}

main().catch((e) => {
  console.error("Fatal", e);
  process.exit(1);
});
