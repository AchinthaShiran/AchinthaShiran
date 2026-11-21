/**
 * Asset manifest (ADR-002): the single place that maps a model key to where it comes from.
 *
 * To replace a procedural model with a real one, change its `source` to
 *   { kind: 'gltf', url: 'models/cozy-house.glb', scale: 1 }
 * and drop the file into `public/models/`. Footprint and height stay, so collision keeps working.
 */
import {
  agentWorkshop,
  architectureMachine,
  cloudGateway,
  dataDisplay,
  energyTube,
  governanceStation,
  identityGate,
  labSign,
  reactorCore,
} from './models/lab';
import {
  bookStack,
  bootcampDesk,
  graduationMonument,
  pavilion,
  podium,
  qualitiesTotem,
  trainingBoard,
  university,
} from './models/campus';
import { car, cityBlock, officeTower, rolePlaque, streetTree, timelineMonument } from './models/city';
import { explorer, miniFigure, ownerAvatar, robot } from './models/characters';
import { crystal, forestSign, glowShroom, skillTreeMonument } from './models/forest';
import {
  cozyHouse,
  fence,
  footbridge,
  lamppost,
  mailbox,
  noticeBoard,
  waterfall,
  windmill,
  workstation,
} from './models/home';
import { bottle, boat, lighthouse, phoneBooth, pier, telescope, welcomeArch } from './models/horizon';
import {
  bird,
  blossomTree,
  bush,
  cloud,
  flower,
  giantFlower,
  giantTree,
  mushroom,
  rock,
  treePine,
  treeRound,
} from './models/nature';
import {
  bench,
  exhibitExcellenceHub,
  exhibitGeneric,
  exhibitSage,
  exhibitTaPortal,
  fountain,
  kiosk,
  sculpture,
} from './models/park';
import { castle, flag, peakSign, trophy } from './models/peak';
import {
  approvalGate,
  arcadeCabinet,
  projectGateway,
  budgetGauge,
  coinStack,
  companionBot,
  entryChute,
  functionMachine,
  gitPortal,
  islandSign,
  learningHall,
  localBrain,
  marketStall,
  npcTalker,
  packageCube,
  packShelf,
  piggyBank,
  planDesk,
  platformDock,
  progressTower,
  recurringClock,
  resourceLibrary,
  roadmapTrail,
  splitTable,
  talaTerminal,
  toolFunnel,
  vault,
} from './models/makers';
import { ideaSeed, placeholder, signpostPost } from './models/props';
import type { Footprint, ModelEntry, ModelProps } from './types';
import type { Object3D } from 'three';

const proc = (
  build: (props: ModelProps) => Object3D,
  footprint: Footprint | null,
  height: number,
): ModelEntry => ({
  source: { kind: 'procedural', build },
  footprint,
  height,
});
const circle = (r: number): Footprint => ({ kind: 'circle', r });
const rect = (w: number, d: number): Footprint => ({ kind: 'box', w, d });

export const manifest = {
  // Characters
  explorer: proc(explorer, null, 2),
  ownerAvatar: proc(ownerAvatar, circle(0.5), 2.1),
  miniFigure: proc(miniFigure, null, 1.3),
  robot: proc(robot, null, 1.6),

  // Nature
  treeRound: proc(treeRound, circle(0.45), 3.4),
  treePine: proc(treePine, circle(0.4), 3.6),
  blossomTree: proc(blossomTree, circle(0.4), 3),
  giantTree: proc(giantTree, circle(1.9), 9.5),
  flower: proc(flower, null, 0.7),
  giantFlower: proc(giantFlower, null, 1.8),
  rock: proc(rock, circle(0.7), 0.8),
  mushroom: proc(mushroom, null, 1),
  bush: proc(bush, null, 0.9),
  cloud: proc(cloud, null, 4),
  bird: proc(bird, null, 0.3),

  // Home Island
  cozyHouse: proc(cozyHouse, rect(5.4, 4.6), 6.5),
  workstation: proc(workstation, rect(2.6, 1.6), 2.2),
  noticeBoard: proc(noticeBoard, rect(2.6, 0.6), 2.8),
  mailbox: proc(mailbox, circle(0.45), 1.8),
  footbridge: proc(footbridge, null, 0.6),
  waterfall: proc(waterfall, null, 1),
  windmill: proc(windmill, circle(1.1), 6.5),
  lamppost: proc(lamppost, circle(0.2), 3),
  fence: proc(fence, rect(2, 0.2), 0.8),
  signpostPost: proc(signpostPost, circle(0.25), 3.6),

  // Career City
  officeTower: proc(officeTower, rect(7.6, 7.6), 10),
  cityBlock: proc(cityBlock, rect(3.2, 3.2), 6),
  car: proc(car, null, 1.2),
  timelineMonument: proc(timelineMonument, circle(2.5), 5.4),
  rolePlaque: proc(rolePlaque, circle(0.8), 2.5),
  streetTree: proc(streetTree, circle(0.5), 2.5),

  // Innovation Lab
  reactorCore: proc(reactorCore, circle(3.6), 6),
  agentWorkshop: proc(agentWorkshop, rect(4.8, 2.4), 3.8),
  governanceStation: proc(governanceStation, circle(1.8), 5.6),
  architectureMachine: proc(architectureMachine, rect(4.2, 2), 4.6),
  identityGate: proc(identityGate, rect(4.2, 0.9), 4.8),
  cloudGateway: proc(cloudGateway, circle(1.9), 4.4),
  energyTube: proc(energyTube, null, 2.2),
  dataDisplay: proc(dataDisplay, rect(2.2, 0.3), 2.6),
  labSign: proc(labSign, rect(3.8, 0.3), 2.8),

  // Project Park
  exhibitSage: proc(exhibitSage, circle(3), 3.2),
  exhibitExcellenceHub: proc(exhibitExcellenceHub, circle(3), 3.4),
  exhibitTaPortal: proc(exhibitTaPortal, circle(3), 3),
  exhibitGeneric: proc(exhibitGeneric, circle(3), 3.4),
  kiosk: proc(kiosk, rect(1.6, 1.2), 3.2),
  fountain: proc(fountain, circle(2.8), 3),
  bench: proc(bench, null, 1),
  sculpture: proc(sculpture, circle(0.5), 3),

  // Skill Forest
  crystal: proc(crystal, circle(1.0), 3),
  skillTreeMonument: proc(skillTreeMonument, circle(3), 7),
  forestSign: proc(forestSign, rect(3.2, 0.3), 2.6),
  glowShroom: proc(glowShroom, null, 0.7),

  // Achievement Peak
  trophy: proc(trophy, rect(1.3, 1.3), 3.2),
  flag: proc(flag, circle(0.1), 3.2),
  castle: proc(castle, rect(6, 3.6), 7.8),
  peakSign: proc(peakSign, rect(3.4, 0.3), 2.7),

  // Horizon Island
  lighthouse: proc(lighthouse, circle(1.8), 9),
  bottle: proc(bottle, circle(0.6), 1.2),
  phoneBooth: proc(phoneBooth, rect(1.2, 1.2), 2.9),
  telescope: proc(telescope, circle(0.5), 2),
  pier: proc(pier, null, 0.3),
  boat: proc(boat, null, 3),
  welcomeArch: proc(welcomeArch, null, 3.8),

  // Education & mentorship
  university: proc(university, rect(6.4, 5), 7),
  graduationMonument: proc(graduationMonument, circle(1.2), 3.6),
  bookStack: proc(bookStack, null, 0.9),
  pavilion: proc(pavilion, circle(3.1), 4.8),
  trainingBoard: proc(trainingBoard, rect(2.6, 0.6), 2.8),
  bootcampDesk: proc(bootcampDesk, rect(2, 1.2), 2),
  podium: proc(podium, rect(1.6, 1.2), 2.2),
  qualitiesTotem: proc(qualitiesTotem, circle(0.9), 5.2),

  // Makers' Row — personal project islands (ADR-005)
  islandSign: proc(islandSign, rect(3.8, 0.3), 2.8),
  // Tala Workshop
  talaTerminal: proc(talaTerminal, rect(4.6, 2.9), 5.2),
  packShelf: proc(packShelf, rect(3.8, 1.2), 4.8),
  approvalGate: proc(approvalGate, rect(4.8, 1.0), 4.2),
  localBrain: proc(localBrain, circle(1.9), 4),
  platformDock: proc(platformDock, circle(2.6), 3.2),
  toolFunnel: proc(toolFunnel, circle(1.8), 5.4),
  // Skill Up Academy
  learningHall: proc(learningHall, rect(6.4, 4.6), 8.4),
  planDesk: proc(planDesk, rect(3.6, 2.0), 3.8),
  roadmapTrail: proc(roadmapTrail, circle(2.6), 4.8),
  resourceLibrary: proc(resourceLibrary, rect(3.4, 1.0), 4.4),
  companionBot: proc(companionBot, circle(1.2), 4.4),
  progressTower: proc(progressTower, rect(4.2, 1.4), 5),
  // MySpend Market
  piggyBank: proc(piggyBank, circle(2.7), 5.6),
  entryChute: proc(entryChute, rect(4.6, 1.6), 3.8),
  budgetGauge: proc(budgetGauge, circle(1.1), 4.8),
  recurringClock: proc(recurringClock, circle(1.2), 5.8),
  splitTable: proc(splitTable, circle(2.4), 3.2),
  vault: proc(vault, rect(3.8, 1.4), 3.8),
  marketStall: proc(marketStall, rect(2.6, 1.4), 3.2),
  coinStack: proc(coinStack, circle(0.6), 1.2),
  // Unity Arcade
  packageCube: proc(packageCube, circle(2.5), 6.4),
  gitPortal: proc(gitPortal, rect(3.4, 2.6), 3.8),
  npcTalker: proc(npcTalker, circle(1.4), 4.4),
  functionMachine: proc(functionMachine, rect(3.4, 2.0), 4.2),
  arcadeCabinet: proc(arcadeCabinet, rect(1.5, 1.2), 3.2),
  // Project Park gateways to the personal project islands
  projectGateway: proc(projectGateway, rect(2.6, 0.9), 4.2),

  // Collectibles & fallbacks
  ideaSeed: proc(ideaSeed, null, 1.6),
  placeholder: proc(placeholder, circle(0.6), 1),
} satisfies Record<string, ModelEntry>;

export type ModelKey = keyof typeof manifest;

export const isModelKey = (key: string): key is ModelKey => Object.hasOwn(manifest, key);

export function getModel(key: ModelKey): ModelEntry {
  return manifest[key];
}
