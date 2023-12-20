import { toArray } from "@/utils/parse";
import { z } from "zod";

const hourMs = 60 * 60 * 1000;
const dayMs = 24 * hourMs;

function nextHour(date: Date) {
  const next = new Date(date);
  next.setTime(next.getTime() + hourMs);
  return next;
}

function nextDay(date: Date) {
  const next = new Date(date);
  next.setTime(next.getTime() + dayMs);
  return next;
}

const date = z.preprocess(function (raw: any) {
  if (raw === undefined) return null;
  // sometimes YAML parser return dates, sometimes strings that can be converted to dates
  if (typeof raw === "string") {
    raw = new Date(raw);
    if (isNaN(raw.getTime())) throw new Error("Invalid date");
  }
  return raw;
}, z.nullable(z.date()));

const durationParser = z.optional(z.string());

const dateRange = z.preprocess(
  function (raw: any) {
    if (!raw) return null;
    if (typeof raw === "string" || raw instanceof Date) {
      raw = { start: raw, end: raw };
    }
    if (typeof raw !== "object") throw new Error("Invalid date range (object)");
    const start = date.parse(raw.start);

    if (!start) throw new Error("Invalid date range (missing start)");

    const duration = durationParser.parse(raw.duration);
    let end: Date | null;
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

  z.nullable(
    z.object({
      start: z.date(),
      end: z.date(),
    }),
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
