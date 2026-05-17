// FILE: src/utils/progressCalculator.test.ts

import { calculateProgress, formatAchievementDisplay, getUoMDescription } from './progressCalculator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASS: ${message}`);
}

function runTests() {
  console.log('\n🧪 Running Progress Calculator Tests\n');

  // ============================================
  // MIN TESTS (Higher is Better)
  // ============================================
  console.log('\n--- MIN Tests (Higher is Better) ---\n');

  // Test 1: 80/100 = 80%
  let result = calculateProgress('MIN', 100, 80);
  assert(result.percentage === 80, `MIN: 80/100 should be 80%, got ${result.percentage}%`);
  assert(result.status === 'on_track', `MIN: 80% should be on_track, got ${result.status}`);

  // Test 2: 120/100 = 120% (over-achieved)
  result = calculateProgress('MIN', 100, 120);
  assert(result.percentage === 120, `MIN: 120/100 should be 120%, got ${result.percentage}%`);
  assert(result.status === 'over_achieved', `MIN: 120% should be over_achieved, got ${result.status}`);

  // Test 3: 150/100 = 150% (capped)
  result = calculateProgress('MIN', 100, 150);
  assert(result.percentage === 150, `MIN: 150/100 should be 150%, got ${result.percentage}%`);
  assert(result.status === 'over_achieved', `MIN: 150% should be over_achieved`);

  // Test 4: 50/100 = 50% (at risk)
  result = calculateProgress('MIN', 100, 50);
  assert(result.percentage === 50, `MIN: 50/100 should be 50%, got ${result.percentage}%`);
  assert(result.status === 'at_risk', `MIN: 50% should be at_risk, got ${result.status}`);

  // Test 5: 0/100 = 0% (not started)
  result = calculateProgress('MIN', 100, 0);
  assert(result.percentage === 0, `MIN: 0/100 should be 0%, got ${result.percentage}%`);
  assert(result.status === 'not_started', `MIN: 0% should be not_started, got ${result.status}`);

  // Test 6: Division by zero
  result = calculateProgress('MIN', 0, 50);
  assert(result.percentage === 0, `MIN: 0 target should return 0%, got ${result.percentage}%`);

  // Test 7: 100/100 = 100% (completed)
  result = calculateProgress('MIN', 100, 100);
  assert(result.percentage === 100, `MIN: 100/100 should be 100%, got ${result.percentage}%`);
  assert(result.status === 'completed', `MIN: 100% should be completed, got ${result.status}`);

  // ============================================
  // MAX TESTS (Lower is Better)
  // ============================================
  console.log('\n--- MAX Tests (Lower is Better) ---\n');

  // Test 1: 18/24 = 133% (better than target!)
  result = calculateProgress('MAX', 24, 18);
  assert(result.percentage === 133, `MAX: 18/24 should be 133%, got ${result.percentage}%`);
  assert(result.status === 'over_achieved', `MAX: 133% should be over_achieved`);

  // Test 2: 30/24 = 80% (worse than target)
  result = calculateProgress('MAX', 24, 30);
  assert(result.percentage === 80, `MAX: 30/24 should be 80%, got ${result.percentage}%`);
  assert(result.status === 'on_track', `MAX: 80% should be on_track`);

  // Test 3: 24/24 = 100% (exactly on target)
  result = calculateProgress('MAX', 24, 24);
  assert(result.percentage === 100, `MAX: 24/24 should be 100%, got ${result.percentage}%`);
  assert(result.status === 'completed', `MAX: 100% should be completed`);

  // Test 4: 48/24 = 50% (doubled - much worse)
  result = calculateProgress('MAX', 24, 48);
  assert(result.percentage === 50, `MAX: 48/24 should be 50%, got ${result.percentage}%`);
  assert(result.status === 'at_risk', `MAX: 50% should be at_risk`);

  // Test 5: 0/24 = 100% (no defects = full success!)
  result = calculateProgress('MAX', 24, 0);
  assert(result.percentage === 100, `MAX: 0/24 should be 100%, got ${result.percentage}%`);
  assert(result.status === 'completed', `MAX: 0 should be completed (no defects)`);

  // Test 6: Division by zero in target
  result = calculateProgress('MAX', 0, 10);
  assert(result.percentage === 0, `MAX: 0 target should return 0%, got ${result.percentage}%`);

  // ============================================
  // TIMELINE TESTS (Date-based)
  // ============================================
  console.log('\n--- TIMELINE Tests (Date-based) ---\n');

  // Test 1: Completed before deadline = 100%
  result = calculateProgress('TIMELINE', 100, 100, '2026-12-31', '2026-01-01', true);
  assert(result.percentage === 100, `TIMELINE: completed should be 100%, got ${result.percentage}%`);
  assert(result.status === 'completed', `TIMELINE: completed should be completed`);

  // Test 2: Past deadline, not completed = 0%
  const pastDeadline = new Date();
  pastDeadline.setDate(pastDeadline.getDate() - 10);
  const pastDeadlineStr = pastDeadline.toISOString().split('T')[0];
  result = calculateProgress('TIMELINE', 100, 50, pastDeadlineStr, '2026-01-01', false);
  assert(result.percentage === 0, `TIMELINE: past deadline should be 0%, got ${result.percentage}%`);
  assert(result.status === 'not_started', `TIMELINE: past deadline should be not_started`);

  // Test 3: No dates provided - fallback to achievement %
  result = calculateProgress('TIMELINE', 100, 75);
  assert(result.percentage === 75, `TIMELINE: no dates should use achievement %, got ${result.percentage}%`);
  assert(result.status === 'on_track', `TIMELINE: 75% should be on_track`);

  // Test 4: Within deadline, time elapsed < 50% = progress based on time
  const futureDeadline = new Date();
  futureDeadline.setDate(futureDeadline.getDate() + 60);
  const futureDeadlineStr = futureDeadline.toISOString().split('T')[0];
  const pastStart = new Date();
  pastStart.setDate(pastStart.getDate() - 30);
  const pastStartStr = pastStart.toISOString().split('T')[0];
  result = calculateProgress('TIMELINE', 100, 50, futureDeadlineStr, pastStartStr, false);
  assert(result.percentage > 0 && result.percentage <= 100, `TIMELINE: within deadline should show progress`);

  // ============================================
  // ZERO TESTS (0 = Success)
  // ============================================
  console.log('\n--- ZERO Tests (0 = Success) ---\n');

  // Test 1: achievement = 0 → 100%
  result = calculateProgress('ZERO', 0, 0);
  assert(result.percentage === 100, `ZERO: 0 should be 100%, got ${result.percentage}%`);
  assert(result.status === 'completed', `ZERO: 0 should be completed`);

  // Test 2: achievement = 3 → 0%
  result = calculateProgress('ZERO', 0, 3);
  assert(result.percentage === 0, `ZERO: 3 should be 0%, got ${result.percentage}%`);
  assert(result.status === 'not_started', `ZERO: 3 should be not_started`);

  // Test 3: achievement = 1 → 0%
  result = calculateProgress('ZERO', 0, 1);
  assert(result.percentage === 0, `ZERO: 1 should be 0%, got ${result.percentage}%`);

  // Test 4: achievement = 0 with target != 0 (edge case)
  result = calculateProgress('ZERO', 5, 0);
  assert(result.percentage === 100, `ZERO: 0 with non-zero target should be 100%, got ${result.percentage}%`);

  // ============================================
  // Helper Function Tests
  // ============================================
  console.log('\n--- Helper Function Tests ---\n');

  // getUoMDescription tests
  let desc = getUoMDescription('MIN');
  assert(desc.label === 'Min (Higher is Better)', `MIN label should be correct`);
  assert(desc.direction === 'higher_better', `MIN direction should be higher_better`);
  assert(desc.example.includes('Revenue'), `MIN example should include Revenue`);

  desc = getUoMDescription('MAX');
  assert(desc.label === 'Max (Lower is Better)', `MAX label should be correct`);
  assert(desc.direction === 'lower_better', `MAX direction should be lower_better`);
  assert(desc.example.includes('TAT'), `MAX example should include TAT`);

  desc = getUoMDescription('TIMELINE');
  assert(desc.direction === 'time_based', `TIMELINE direction should be time_based`);

  desc = getUoMDescription('ZERO');
  assert(desc.direction === 'binary', `ZERO direction should be binary`);

  // formatAchievementDisplay tests
  let display = formatAchievementDisplay('MIN', 80, 100, '%');
  assert(display.formatted === '80 % / 100 %', `MIN display should format correctly`);
  assert(display.subtext === '80% of target', `MIN subtext should show percentage`);
  assert(!display.isSuccess, `80% should not be considered success`);

  display = formatAchievementDisplay('MIN', 120, 100, 'L');
  assert(display.isSuccess, `120% should be considered success (over-achieved)`);

  display = formatAchievementDisplay('MAX', 18, 24, 'hrs');
  assert(display.formatted.includes('18'), `MAX display should show actual first`);
  assert(display.isSuccess, `18/24 should be success (lower is better)`);

  display = formatAchievementDisplay('MAX', 30, 24, 'hrs');
  assert(!display.isSuccess, `30/24 should not be success`);

  display = formatAchievementDisplay('ZERO', 0, 0, 'incidents');
  assert(display.isSuccess, `0 incidents should be success`);
  assert(display.subtext.includes('Success'), `ZERO success subtext should say Success`);

  display = formatAchievementDisplay('ZERO', 2, 0, 'complaints');
  assert(!display.isSuccess, `2 complaints should not be success`);
  assert(display.subtext.includes('not achieved'), `ZERO failure subtext should say not achieved`);

  console.log('\n✅ All Tests Passed!\n');
}

// Run tests
runTests();

export { runTests };