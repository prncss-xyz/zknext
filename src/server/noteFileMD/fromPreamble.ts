import { toArray } from "@/utils/parse";
import { z } from "zod";

const hourMs = 60 * 60 * 1000;
const dayMs = 24 * hourMs;

function nextHour(date: number) {
  return date + hourMs;
}

function nextDay(date: number) {
  return date + dayMs;
}

// sometimes YAML parser return dates, sometimes strings that can be converted to dates
const date = z.preprocess(function (raw: unknown) {
  if (raw === undefined) return undefined;
  let d: Date | undefined;

  if (typeof raw === "string") {
    d = new Date(raw);
  }
  if (raw instanceof Date) {
    d = raw;
  }
  if (d !== undefined) {
    const num = d.getTime();
    if (isNaN(num)) throw new Error("Invalid date");
    return num;
  }
  throw new Error("Invalid date");
}, z.optional(z.number()));

const durationParser = z.optional(z.string());

const dateRange = z.preprocess(
  function (raw: any) {
    if (!raw) return undefined;
    if (typeof raw === "string" || raw instanceof Date) {
      raw = { start: raw, end: raw };
    }
    if (typeof raw !== "object") throw new Error("Invalid date range (object)");
    const start = date.parse(raw.start);

    if (!start) throw new Error("Invalid date range (missing start)");

    const duration = durationParser.parse(raw.duration);
    let end: number | undefined;
    end = date.parse(raw.end);

    // exactly one of them must be defined
    if (!!end === !!duration)
      throw new Error(
        "Invalid date range (either end or duration must be defined)",
      );
    switch (duration) {
      case undefined:
        break;
      case "day":
        end = nextDay(start);
        break;
      case "hour":
        end = nextHour(start);
        break;
      default:
        throw new Error("Invalid date range (duration)");
    }
    return { start, end };
  },

  z.optional(
    z
      .object({
        start: z.number(),
        end: z.number(),
      })
      .or(z.undefined()),
  ),
);

const dataSchema = z.object({
  tags: z.preprocess(toArray, z.array(z.string())),
  event: dateRange,
  due: date,
  since: date,
  until: date,
  asset: z.string().default(""),
});

export function fromPreamble(preamble: unknown) {
  return dataSchema.parse(preamble);
}
