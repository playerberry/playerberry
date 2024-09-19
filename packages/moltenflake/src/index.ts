import type { DeconstructedSnowflake } from '../typings';

/**
 * PlayerBerry epoch timestamp (2015-01-01T00:00:00.000Z) in milliseconds.
 * @type {bigint}
 * @readonly
 */
const EPOCH: bigint = 1_420_070_400_000n;
let increment: bigint = 0n;

/**
 * A class for generating and deconstructing PlayerBerry snowflakes.
 */
export default class MoltenFlake {
  /**
   * Generates a PlayerBerry snowflake.
   * @param {number|Date} [timestamp=Date.now()] The timestamp or date for which to generate the snowflake.
   * @returns {string} The generated snowflake as a string.
   * @throws {TypeError} Throws if the timestamp is not a valid number or date.
   */
  static generate(timestamp: number | Date = Date.now()): string {
    if (timestamp instanceof Date) {
      timestamp = timestamp.getTime();
    }

    if (typeof timestamp !== 'number' || isNaN(timestamp)) {
      throw new TypeError(`Invalid timestamp: expected number but received ${typeof timestamp}`);
    }

    // Reset increment if it reaches its maximum value
    if (increment >= 0b111111111111n) {
      increment = 0n;
    }

    // Generate snowflake: (timestamp << 22) | (workerId << 17) | increment
    const snowflake = ((BigInt(timestamp) - EPOCH) << 22n) | (1n << 17n) | increment++;
    return snowflake.toString();
  }

  /**
   * Deconstructs a PlayerBerry snowflake into its components.
   * @param {string} snowflake The snowflake to deconstruct.
   * @returns {Object} The deconstructed components of the snowflake.
   * @throws {TypeError} Throws if the snowflake is not a valid string representation of a number.
   */
  static deconstruct(snowflake: string): DeconstructedSnowflake {
    const bigIntSnowflake = BigInt(snowflake);
    const timestamp = Number(bigIntSnowflake >> 22n) + Number(EPOCH);

    return {
      timestamp,
      get date(): Date {
        return new Date(this.timestamp);
      },
      workerId: Number((bigIntSnowflake >> 17n) & 0b11111n),
      processId: Number((bigIntSnowflake >> 12n) & 0b11111n),
      increment: Number(bigIntSnowflake & 0b111111111111n),
      binary: bigIntSnowflake.toString(2).padStart(64, '0'),
    };
  }

  /**
   * Retrieves the timestamp from a PlayerBerry snowflake.
   * @param {string} snowflake The snowflake to extract the timestamp from.
   * @returns {number} The timestamp in milliseconds since the epoch.
   * @throws {TypeError} Throws if the snowflake is not a valid string representation of a number.
   */
  static getTimestamp(snowflake: string): number {
    return Number(BigInt(snowflake) >> 22n) + Number(EPOCH);
  }

  /**
   * Calculates the duration between two PlayerBerry snowflakes.
   * @param {string} snowflake1 The first snowflake.
   * @param {string} snowflake2 The second snowflake.
   * @returns {number} The duration between the two snowflakes in milliseconds.
   * @throws {TypeError} Throws if either snowflake is not a valid string representation of a number.
   */
  static calculateDuration(snowflake1: string, snowflake2: string): number {
    const timestamp1 = MoltenFlake.getTimestamp(snowflake1);
    const timestamp2 = MoltenFlake.getTimestamp(snowflake2);

    return Math.abs(timestamp1 - timestamp2);
  }

  /**
   * Gets the epoch timestamp used for generating snowflakes.
   * @type {number}
   * @readonly
   */
  static get EPOCH(): number {
    return Number(EPOCH);
  }
}
