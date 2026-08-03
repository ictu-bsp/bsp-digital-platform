import test from "node:test";
import assert from "node:assert/strict";
import { buildInitialBadgeProgress, mergeBadgeProgressWithDefaults } from "./advancement-progress";
import { getAdvancementRanksForSection } from "./scout-advancement-rank";

test("buildInitialBadgeProgress returns a checklist structure for a rank", () => {
  const progress = buildInitialBadgeProgress("tenderfoot");

  assert.equal(progress.length, 3);
  assert.equal(progress[0]?.name, "Tie and use the square knot and two half hitches");
  assert.equal(progress[0]?.approvalStatus, "NOT_SUBMITTED");
});

test("Kid Scouts receive a fallback advancement ladder and checklist", () => {
  const ranks = getAdvancementRanksForSection("KID");
  const progress = buildInitialBadgeProgress("kid-scout");

  assert.equal(ranks.length, 1);
  assert.match(ranks[0]?.label ?? "", /Kid Scout/i);
  assert.equal(progress.length, 3);
  assert.equal(progress[0]?.name, "Attend a unit meeting and greet the troop leaders");
});

test("mergeBadgeProgressWithDefaults preserves default checklists when persisted progress is empty", () => {
  const defaults = {
    membership: buildInitialBadgeProgress("membership"),
  };

  const merged = mergeBadgeProgressWithDefaults(defaults, {});

  assert.equal(merged.membership.length, 3);
  assert.equal(merged.membership[0]?.name, "Memorize the Scout Oath, Law, and Motto");
});

test("default checklist items do not start approved or completed", () => {
  const progress = buildInitialBadgeProgress("membership");

  assert.equal(progress[0]?.isCompleted, false);
  assert.equal(progress[0]?.approvalStatus, "NOT_SUBMITTED");
  assert.equal(progress[1]?.isCompleted, false);
  assert.equal(progress[1]?.approvalStatus, "NOT_SUBMITTED");
});

test("rank ids from the advancement page resolve to real checklist templates", () => {
  const progress = buildInitialBadgeProgress("tenderfoot-scout");

  assert.equal(progress.length, 3);
  assert.equal(progress[0]?.name, "Tie and use the square knot and two half hitches");
});
