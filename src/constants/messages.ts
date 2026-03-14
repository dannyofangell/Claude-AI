export interface MessageContext {
  remaining: string;
  elapsed: string;
  duration: string;
  distanceKm?: string;
}

function interpolate(template: string, ctx: MessageContext): string {
  return template
    .replace(/{remaining}/g, ctx.remaining)
    .replace(/{elapsed}/g, ctx.elapsed)
    .replace(/{duration}/g, ctx.duration)
    .replace(/{distance}/g, ctx.distanceKm ?? '');
}

export const MESSAGES = {
  start: [
    "Let's go! You've got {duration} ahead of you. Own it!",
    "Starting your {duration} run. You are already doing better than yesterday!",
    "Here we go! {duration} of pure greatness. Let's make it count!",
  ],

  interval: [
    "You have {remaining} left. You are absolutely crushing it!",
    "{remaining} to go. Keep that pace strong, you legend!",
    "Still going strong! {remaining} remaining. You've got this!",
  ],

  halfway: [
    "Halfway there! {elapsed} down, {remaining} to go. You are amazing!",
    "Half way done! Keep it up — the second half is where champions are made!",
  ],

  three_quarters: [
    "Three quarters done! Only {remaining} left. Do not stop now — you are so close!",
    "75 percent complete! {remaining} to go. Dig deep and finish strong!",
  ],

  last_warning: [
    "Five minutes left! Give it everything you have got!",
    "Almost there! Just {remaining} to go. Finish like a champion!",
    "Last push! {remaining} remaining. Make every step count!",
  ],

  motivational: [
    "You are doing incredible — keep pushing!",
    "Remember why you started. You have got this!",
    "Pain is temporary, pride is forever. Keep moving!",
    "You are stronger than you think!",
    "Look how far you have come. Do not stop now!",
    "Every step is making you stronger. Keep going!",
    "You chose to run today. That already makes you a winner!",
    "Breathe. Relax. You are built for this!",
    "Your body can handle it. Trust your training!",
    "Champions are made in moments like this. Push through!",
  ],

  completion: [
    "Run complete! {elapsed} of amazing work. You should be so proud!",
    "You did it! {elapsed} done. That is how legends are made!",
    "Finished! What an incredible run. {elapsed} and you owned every second!",
  ],
} as const;

type MessageType = keyof typeof MESSAGES;

export function pickMessage(type: MessageType, ctx: MessageContext, seed?: number): string {
  const options = MESSAGES[type] as readonly string[];
  const idx = seed !== undefined
    ? seed % options.length
    : Math.floor(Math.random() * options.length);
  return interpolate(options[idx], ctx);
}
