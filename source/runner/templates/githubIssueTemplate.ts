import { DangerResults } from "../../dsl/DangerResults"
import { Violation } from "../../platforms/messaging/violation"
import * as v from "voca"

/**
 * Converts a set of violations into a HTML table
 *
 * @param {string} name User facing title of table
 * @param {string} emoji Emoji name to show next to each item
 * @param {Violation[]} violations for table
 * @returns {string} HTML
 */
function table(name: string, emoji: string, violations: Violation[]): string {
  if (violations.length === 0 || violations.every(violation => !violation.message)) { return "" }
  return `
<table>
  <thead>
    <tr>
      <th width="50"></th>
      <th width="100%" data-danger-table="true">${name}</th>
    </tr>
  </thead>
  <tbody>${violations.map((v: Violation) => { return `<tr>
      <td>:${emoji}:</td>
      <td>${v.message}</td>
    </tr>
  ` }).join("\n")}</tbody>
</table>
`
}

function getSummary(label: string, violations: Violation[]): string {
  return violations.map(x => v.truncate(x.message, 20))
    .reduce((acc, value, idx) => `${acc} ${value}${idx === violations.length - 1 ? "" : ","}`, `${violations.length} ${label}: `)
}

function buildSummaryMessage(results: DangerResults): string {
  const {fails, warnings, messages, markdowns } = results
  const summary =
`  ${getSummary("failure", fails)}
  ${getSummary("warning", warnings)}
  ${messages.length > 0 ? `${messages.length} messages` : ""}
  ${markdowns.length > 0 ? `${markdowns.length} markdown notices` : ""}`
  return summary
}

/**
 * A template function for creating a GitHub issue comment from Danger Results
 * @param {DangerResults} results Data to work with
 * @returns {string} HTML
 */
export function template(results: DangerResults): string {
  return `
<!--
${buildSummaryMessage(results)}
-->
${table("Fails", "no_entry_sign", results.fails)}
${table("Warnings", "warning", results.warnings)}
${table("Messages", "book", results.messages)}
${results.markdowns.join("\n\n")}
<p align="right">
  Generated by :no_entry_sign: <a href="http://github.com/danger/danger-js/">dangerJS</a>
</p>
`
}
