import { solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/web/pbkdf2";
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
   * Menyelesaikan tantangan ALTCHA Proof-of-Work menggunakan altcha-lib.
   * Menggunakan solveChallenge bawaan altcha-lib agar format solution
   * 100% kompatibel dengan verifySolution di backend.
   *
   * @param {Object} challengeData Data tantangan dari backend
   *   Format: { parameters: { algorithm, cost, keyLength, keyPrefix, nonce, salt }, signature }
   * @returns {Promise<{ solution: Object, payload: string }>}
   */
  async solve(challengeData) {
    // Use altcha-lib's own solver for full compatibility with backend's verifySolution.
    // This ensures password encoding (nonce + counter as uint32 BE) matches exactly.
    const solution = await solveChallenge({
      challenge: challengeData,
      deriveKey,
    });

    if (!solution) {
      throw new Error("Gagal menyelesaikan tantangan captcha (timeout).");
    }

    // Build payload in the same format expected by backend's verifyCaptchaPayload:
    // base64(JSON.stringify({ challenge, solution }))
    const payloadObj = { challenge: challengeData, solution };
    return {
      solution,
      payload: btoa(JSON.stringify(payloadObj)),
    };
  },
};
