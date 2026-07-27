import masterInstance from "../../api/masterInstance";

export const captchaService = {
  /**
   * Mengambil tantangan ALTCHA dari backend.
   * Endpoint: GET /public/captcha/challenge
   */
  async getChallenge() {
    const response = await masterInstance.get("/public/captcha/challenge");
    return response.data;
  },

  /**
   * Menyelesaikan tantangan ALTCHA Proof-of-Work (PBKDF2/SHA-256) menggunakan Web Crypto API.
   * Mengakomodasi respon bertingkat dari backend:
   * {
   *   parameters: { algorithm, cost, keyLength, keyPrefix, nonce, salt },
   *   signature: "..."
   * }
   * @param {Object} challengeData Data tantangan dari backend
   * @returns {Promise<{ solution: Object, payload: string }>}
   */
  async solve(challengeData) {
    const params = challengeData?.parameters || challengeData || {};
    const signature = challengeData?.signature || params.signature || "";

    return await this.solveWithWebCrypto(params, signature);
  },

  /**
   * Native Web Crypto PBKDF2/SHA-256 solver
   */
  async solveWithWebCrypto(params, signature) {
    const algorithm = params.algorithm || "PBKDF2/SHA-256";
    const cost = params.cost || 5000;
    const keyLength = params.keyLength || 32;
    const keyPrefix = params.keyPrefix || "00";
    const salt = params.salt || "";

    const hexToBytes = (hex) => {
      if (!hex) return new Uint8Array(0);
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
      }
      return bytes;
    };

    const bytesToHex = (bytes) => {
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    };

    const isHex = /^[0-9a-fA-F]+$/.test(salt) && salt.length % 2 === 0;
    const saltBytes = isHex ? hexToBytes(salt) : new TextEncoder().encode(salt);
    const encoder = new TextEncoder();

    let number = 0;
    const maxIterations = 1000000;

    while (number < maxIterations) {
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(number.toString()),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );

      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          hash: "SHA-256",
          salt: saltBytes,
          iterations: cost,
        },
        key,
        keyLength * 8
      );

      const hexResult = bytesToHex(new Uint8Array(derivedBits));

      if (hexResult.startsWith(keyPrefix)) {
        const solution = {
          algorithm,
          challenge: hexResult,
          number,
          salt,
          signature,
        };
        return {
          solution,
          payload: btoa(JSON.stringify(solution)),
        };
      }
      number++;
    }

    throw new Error("Gagal menyelesaikan tantangan captcha dalam batas iterasi.");
  },
};
