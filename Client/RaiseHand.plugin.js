/**
 * @name RaiseHand
 * @author RaiseHand
 * @description Shows a hand on your video when you use /queue; hides it with /lower. Works with the RaiseHand Discord bot.
 * @version 1.3.0
 */

const MARKER_SHOW_PREFIX = "RaiseHand:SHOW";
const MARKER_LOWER = "RaiseHand:LOWER";
const MARKER_POS_PREFIX = "RaiseHand:POS";
function parseShowMarker(text) {
  const i = text.indexOf(MARKER_SHOW_PREFIX);
  if (i === -1) return null;
  const rest = text.slice(i + MARKER_SHOW_PREFIX.length);
  const match = /^:(\d+)/.exec(rest);
  return match ? parseInt(match[1], 10) : 1;
}
/** Parse RaiseHand:POS:1:userId1:2:userId2 -> Map userId -> position. Returns empty Map when queue is empty (POS: with nothing after). */
function parsePosMarker(text) {
  const i = text.indexOf(MARKER_POS_PREFIX);
  if (i === -1) return null;
  const rest = text.slice(i + MARKER_POS_PREFIX.length).replace(/^\:+/, "");
  const parts = rest.split(":");
  const map = new Map();
  for (let j = 0; j + 1 < parts.length; j += 2) {
    const pos = parseInt(parts[j], 10);
    const id = parts[j + 1];
    if (!isNaN(pos) && id) map.set(String(id).trim(), pos);
  }
  return map;
}
function getCurrentUserId() {
  try {
    const mod = BdApi.Webpack.getModule(m => m.getCurrentUser && typeof m.getCurrentUser === "function");
    if (mod && mod.getCurrentUser) return mod.getCurrentUser().id;
    const byProps = BdApi.Webpack.getModule(m => m.getCurrentUser != null && m.getUser != null);
    if (byProps && byProps.getCurrentUser) return byProps.getCurrentUser().id;
  } catch (_) {}
  return null;
}

// Hand outline based on the 🤚 emoji (user-provided SVG path)
const HAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
  <path d="M0 0 C5.97539982 5.13271523 10.48580593 10.67167701 14.0625 17.6875 C14.0625 18.3475 14.0625 19.0075 14.0625 19.6875 C14.88234375 19.33816406 15.7021875 18.98882812 16.546875 18.62890625 C17.62453125 18.17386719 18.7021875 17.71882813 19.8125 17.25 C20.87984375 16.79753906 21.9471875 16.34507813 23.046875 15.87890625 C32.65583252 12.08262122 43.9645446 12.35507949 53.4765625 16.33984375 C57.95987935 18.67631552 62.26117169 21.33969242 66.0625 24.6875 C66.0625 25.3475 66.0625 26.0075 66.0625 26.6875 C66.7225 26.6875 67.3825 26.6875 68.0625 26.6875 C76.04323943 36.45669429 78.27388354 47.39596074 79.0625 59.6875 C79.93390625 59.39875 80.8053125 59.11 81.703125 58.8125 C94.58060555 54.79873983 105.41928158 54.18550893 118.0625 59.6875 C121.42199218 61.70115616 124.23385843 63.98642462 127.0625 66.6875 C127.69929688 67.28433594 128.33609375 67.88117188 128.9921875 68.49609375 C138.27659158 78.07935204 140.22401989 90.01002072 140.19621277 102.85543823 C140.19847833 103.63769905 140.20074388 104.41995987 140.20307809 105.22592556 C140.20936749 107.82625089 140.20859198 110.42652342 140.20776367 113.02685547 C140.21075849 114.90028449 140.21416176 116.7737129 140.21794128 118.6471405 C140.22675667 123.72416304 140.22911848 128.8011687 140.22975707 133.87819815 C140.23046943 137.05771782 140.23260736 140.23723325 140.23525429 143.41675186 C140.2445024 154.53141805 140.2485902 165.64607228 140.24780273 176.76074219 C140.24720338 187.08294545 140.25772855 197.40509622 140.2735464 207.72728622 C140.28667798 216.61682976 140.29198422 225.50635628 140.29134732 234.39590943 C140.29109381 239.69264772 140.29386278 244.98933942 140.30452538 250.28606796 C140.31430031 255.27821764 140.31422207 260.27027709 140.30700874 265.26243019 C140.30597418 267.08029247 140.3082574 268.89816065 140.3143692 270.71601295 C140.36055815 285.42393301 140.13533847 300.67739561 135.875 314.875 C135.66214355 315.60928223 135.44928711 316.34356445 135.22998047 317.10009766 C130.23040921 333.56990063 121.53267228 348.89992662 110.0625 361.6875 C109.60665527 362.19925781 109.15081055 362.71101563 108.68115234 363.23828125 C89.38280184 384.59572872 61.58684974 398.69675874 32.74572754 400.86138153 C26.84289081 401.13217298 20.93890229 401.10865949 15.03125 401.0859375 C13.14188526 401.08796582 11.25252129 401.0908835 9.36315918 401.09463501 C5.43001754 401.09902278 1.49708223 401.09274308 -2.43603516 401.07861328 C-7.43159672 401.06152366 -12.42667442 401.07138409 -17.42221832 401.08933067 C-21.31573004 401.10026531 -25.20913047 401.09667825 -29.10264587 401.0889473 C-30.94270386 401.08697191 -32.78277256 401.08930878 -34.62281799 401.09638596 C-68.10762156 401.19696946 -96.67128979 389.08359739 -121.78515625 366.9921875 C-122.9375 365.6875 -122.9375 365.6875 -122.9375 363.6875 C-123.5975 363.6875 -124.2575 363.6875 -124.9375 363.6875 C-124.9375 363.0275 -124.9375 362.3675 -124.9375 361.6875 C-125.576875 361.419375 -126.21625 361.15125 -126.875 360.875 C-128.9375 359.6875 -128.9375 359.6875 -129.9375 356.6875 C-131.26157669 356.00263275 -132.59659241 355.33879797 -133.9375 354.6875 C-136.1875 352.6875 -136.1875 352.6875 -137.9375 350.6875 C-137.9375 350.0275 -137.9375 349.3675 -137.9375 348.6875 C-138.82805399 348.2840889 -138.82805399 348.2840889 -139.73659897 347.87252808 C-141.94480008 346.68356943 -143.38493285 345.49150744 -145.1519165 343.72705078 C-145.76323425 343.12137268 -146.374552 342.51569458 -147.00439453 341.8916626 C-147.99270264 340.8972818 -147.99270264 340.8972818 -149.00097656 339.8828125 C-149.70381775 339.18347595 -150.40665894 338.4841394 -151.13079834 337.76361084 C-153.45162986 335.45157946 -155.76507252 333.13231196 -158.078125 330.8125 C-159.68637303 329.2055988 -161.29491789 327.59899463 -162.90374756 325.99267578 C-166.27275497 322.62661706 -169.63811745 319.25696647 -173.00097656 315.88476562 C-177.32105726 311.55327232 -181.65007771 307.23084261 -185.98184586 302.91104126 C-189.30359939 299.59649752 -192.62059584 296.27722631 -195.9361496 292.95648193 C-197.53115583 291.36013772 -199.12765957 289.76528835 -200.7256546 288.17193604 C-202.95250006 285.95014328 -205.17287752 283.7220864 -207.39160156 281.4921875 C-208.39205505 280.4978067 -208.39205505 280.4978067 -209.41271973 279.4833374 C-210.01275818 278.8776593 -210.61279663 278.2719812 -211.23101807 277.64794922 C-212.01965429 276.85818192 -212.01965429 276.85818192 -212.82422256 276.05245972 C-213.9375 274.6875 -213.9375 274.6875 -213.9375 272.6875 C-214.83275391 272.33171875 -214.83275391 272.33171875 -215.74609375 271.96875 C-221.11490323 268.82976692 -223.86626607 261.51910573 -225.75 255.8125 C-228.99578278 243.33470032 -228.64351487 230.02635964 -222.15625 218.55078125 C-214.45239557 206.77277303 -205.34663714 199.51296029 -191.4453125 196.0703125 C-179.32845407 194.2206986 -166.93735146 196.01074129 -156.625 202.875 C-152.39253298 206.10668664 -148.67010262 209.76669584 -144.98828125 213.60546875 C-143.19326526 215.42783736 -141.37524576 217.03698287 -139.375 218.625 C-138.570625 219.305625 -137.76625 219.98625 -136.9375 220.6875 C-136.9375 221.3475 -136.9375 222.0075 -136.9375 222.6875 C-136.1021875 223.0278125 -136.1021875 223.0278125 -135.25 223.375 C-132.3096266 225.04386058 -130.2872647 227.27538665 -127.9375 229.6875 C-127.93511165 228.74843119 -127.93272329 227.80936237 -127.93026257 226.84183693 C-127.87141895 203.97240407 -127.79550603 181.10307616 -127.70178509 158.23375893 C-127.6568555 147.17424092 -127.61743424 136.1147549 -127.59106445 125.05517578 C-127.56806145 115.41353941 -127.53463761 105.77200454 -127.48879844 96.1304487 C-127.46489736 91.02723403 -127.44614815 85.9241197 -127.43988609 80.82085037 C-127.43382119 76.01259713 -127.41377049 71.2046005 -127.38322449 66.39644241 C-127.37446679 64.63652328 -127.37071696 62.87657058 -127.37249184 61.11663055 C-127.38255628 46.52552256 -125.75018617 34.57584586 -115.78125 23.234375 C-106.78586591 14.41422566 -96.748354 10.96985951 -84.33935547 11.08203125 C-76.29839216 11.46154574 -69.10932263 14.10158869 -61.9375 17.6875 C-61.56625 16.635625 -61.56625 16.635625 -61.1875 15.5625 C-56.69337855 5.22602066 -49.20234226 -1.1413895 -38.9375 -5.3125 C-26.34602494 -10.12836297 -10.76729838 -8.00784 0 0 Z M-42.52734375 21.4921875 C-45.57996747 26.24447152 -46.18590422 30.83050937 -46.16455078 36.39144897 C-46.16499736 37.36459925 -46.16499736 37.36459925 -46.16545296 38.35740912 C-46.16407105 40.51754207 -46.14841952 42.67732898 -46.1328125 44.83740234 C-46.12897159 46.39178781 -46.12604519 47.94617576 -46.1239624 49.50056458 C-46.11765111 52.84159327 -46.10512998 56.1825203 -46.08782959 59.52350998 C-46.06073396 64.81055687 -46.04898547 70.09757023 -46.03955078 75.38467407 C-46.01548225 87.56432178 -45.97139555 99.74388163 -45.92709351 111.92346954 C-45.88669859 123.08316175 -45.85056381 134.24282417 -45.83066368 145.40257418 C-45.82072113 150.65399281 -45.80103456 155.90525598 -45.77380371 161.15661216 C-45.75884053 164.42926169 -45.75224437 167.70189014 -45.7478714 170.97456932 C-45.74414059 172.48703091 -45.73696518 173.99948872 -45.72600555 175.51191521 C-45.62031885 190.5766808 -45.62031885 190.5766808 -47.9375 196.6875 C-51.58156062 197.90218687 -55.18337199 198.60884277 -58.9375 197.6875 C-61.47951571 196.04809522 -62.49976053 195.26968546 -63.9375 192.6875 C-64.69641937 188.12502835 -64.58681665 183.56332775 -64.53344727 178.95214844 C-64.53535203 177.53745567 -64.53950931 176.12276441 -64.54574585 174.70808411 C-64.55453 171.66535992 -64.5477944 168.62320642 -64.52908516 165.58052826 C-64.49995592 160.76359955 -64.50779695 155.94716077 -64.52098083 151.13018799 C-64.54164147 141.76844817 -64.52605577 132.40694573 -64.50550842 123.04521942 C-64.48036817 111.14367743 -64.46757583 99.24226968 -64.49546474 87.34072328 C-64.50538679 82.55859542 -64.49536392 77.77705852 -64.46955693 72.99499559 C-64.45732939 70.01067563 -64.46161567 67.02653738 -64.47013474 64.04221153 C-64.47091935 62.012644 -64.45177692 59.98309889 -64.43190002 57.95362854 C-64.47546347 49.9719068 -65.02247656 42.87527555 -70.68763065 36.81544113 C-76.30511568 31.60387193 -81.5790128 30.19949225 -89.15625 30.3828125 C-94.43144068 30.9607126 -98.12352737 32.71906246 -101.7265625 36.62890625 C-106.21123876 42.39947309 -107.08576325 46.68105732 -107.08226013 53.94233704 C-107.08578698 54.79412936 -107.08931382 55.64592168 -107.09294754 56.52352589 C-107.10365411 59.3884921 -107.10731892 62.25342508 -107.11108398 65.1184082 C-107.11738776 67.16820415 -107.12415336 69.21799873 -107.13134766 71.26779175 C-107.1460299 75.68760709 -107.15774966 80.1074171 -107.16729546 84.52724648 C-107.18272923 91.51478695 -107.20667825 98.50228188 -107.23219299 105.48979187 C-107.3034454 125.36157353 -107.36318874 145.2333813 -107.41430664 165.10522461 C-107.44260271 176.07587813 -107.47798011 187.04648637 -107.52096039 198.01709241 C-107.54774761 204.96415368 -107.56564381 211.9111637 -107.57699764 218.85826647 C-107.58612046 223.18082135 -107.60348093 227.50331395 -107.62317657 231.82583237 C-107.63065305 233.83093856 -107.63473319 235.83606072 -107.63517189 237.8411808 C-107.63625427 240.57814819 -107.64950091 243.31479879 -107.66575623 246.05171204 C-107.66183094 247.24223922 -107.66183094 247.24223922 -107.65782636 248.45681745 C-107.69902482 252.89696388 -108.14055438 256.54494918 -109.9375 260.6875 C-112.72327193 263.154898 -114.42085829 263.64697908 -118.125 263.9375 C-129.6893622 261.50838586 -142.22122389 243.40486591 -150.21142578 235.2421875 C-152.30335971 233.10769766 -154.40482573 230.98296852 -156.5078125 228.859375 C-157.13511261 228.21345398 -157.76241272 227.56753296 -158.40872192 226.90203857 C-165.58945611 219.68049327 -172.59221582 215.2786591 -182.9375 214.6875 C-190.27395486 215.16081967 -196.69125199 218.19652376 -201.69921875 223.58203125 C-207.46208876 230.87980611 -208.72588234 237.5028457 -207.9375 246.6875 C-206.06445941 257.82394784 -194.45313165 266.32224075 -186.86035156 273.92578125 C-186.00209778 274.78899994 -185.14384399 275.65221863 -184.25958252 276.54159546 C-181.93485627 278.87830082 -179.60792903 281.21278034 -177.2794466 283.54574203 C-175.81700054 285.01114696 -174.35513162 286.47712536 -172.89342499 287.94326782 C-168.29691581 292.5533989 -163.69844718 297.16156184 -159.09706521 301.76682949 C-153.82732907 307.04104357 -148.564198 312.32173292 -143.30672479 317.60817051 C-139.21238016 321.72426957 -135.11215461 325.83445153 -131.00758338 329.94035244 C-128.56959094 332.37938244 -126.13398159 334.82067265 -123.70453644 337.26821899 C-98.52759705 362.60489166 -72.97079055 381.74096409 -35.83099937 382.09769917 C-33.43928417 382.10448449 -31.04794867 382.09614509 -28.65625 382.0859375 C-26.94624712 382.08796686 -25.23624509 382.09088538 -23.52624512 382.09463501 C-19.96972282 382.09901793 -16.41342899 382.09275929 -12.85693359 382.07861328 C-8.34562735 382.06152384 -3.83485695 382.07138697 0.67642975 382.08933067 C4.19936001 382.10027879 7.72216755 382.09667226 11.24510193 382.0889473 C12.90653042 382.08697558 14.56797084 382.08929516 16.22938538 382.09638596 C30.21748313 382.14301533 43.95976128 380.97201488 57.0625 375.625 C57.80032715 375.33044922 58.5381543 375.03589844 59.29833984 374.73242188 C84.35098486 364.27287574 103.55350232 343.6584211 114.0625 318.6875 C115.62170419 314.40097494 116.97369879 310.11694129 118.0625 305.6875 C118.3155487 304.67121663 118.3155487 304.67121663 118.57370949 303.63440228 C120.62326565 294.13357955 120.35885873 284.59813466 120.35302734 274.9309082 C120.3590198 272.94228871 120.36582698 270.95367154 120.37338257 268.96505737 C120.39096834 263.59136347 120.39573456 258.21773335 120.39701414 252.84401345 C120.39843954 249.48347267 120.4027163 246.12294791 120.40800858 242.76241112 C120.42647824 231.0303177 120.43468228 219.29826959 120.43310547 207.56616211 C120.43190215 196.64094942 120.45304978 185.71593366 120.4845928 174.79077083 C120.51074815 165.39601251 120.5214732 156.00131861 120.52019465 146.60652417 C120.51968517 141.00157712 120.52536192 135.39680559 120.54655075 129.79189491 C120.56592268 124.52469531 120.56606465 119.25783904 120.55151749 113.99062729 C120.54942761 112.06051697 120.55414092 110.1303852 120.5662384 108.20031166 C120.58171043 105.56053263 120.5723705 102.92193498 120.55697632 100.28218079 C120.57240701 99.1435961 120.57240701 99.1435961 120.58814943 97.98200971 C120.50002223 91.11899341 118.08760773 86.08565389 113.6875 80.875 C108.8726412 76.86261766 104.35531253 74.89726042 98.0625 74.6875 C91.52947645 75.85077287 86.60375668 77.82186784 82.0625 82.6875 C78.36558825 88.33325043 77.48767565 93.21973207 77.58007812 99.86987305 C77.57420937 101.19094055 77.57420937 101.19094055 77.56822205 102.53869629 C77.5622768 104.43690467 77.56536295 106.33515896 77.5766449 108.23334312 C77.59398009 111.23911472 77.58636069 114.24393092 77.5723877 117.24971008 C77.5471135 123.62487279 77.55254888 129.9998076 77.5625 136.375 C77.57403076 143.77552812 77.57290382 151.1755901 77.53843689 158.57605934 C77.53134422 161.5349149 77.54801421 164.49303086 77.56555176 167.451828 C77.55984486 169.26565958 77.55302805 171.07948811 77.54492188 172.89331055 C77.55623642 173.71368301 77.56755096 174.53405548 77.57920837 175.37928772 C77.53745645 179.28638849 77.32282744 181.25912429 75.24719238 184.67463684 C72.2220847 187.46181542 70.1327065 187.6875 66.0625 187.6875 C63.18640265 186.47314778 61.60615351 185.55211459 59.93997192 182.90225601 C58.89493616 180.26456565 58.82179638 178.27466596 58.83544922 175.43890381 C58.83559021 174.37636887 58.8357312 173.31383392 58.83587646 172.21910095 C58.85137543 170.47820946 58.85137543 170.47820946 58.8671875 168.70214844 C58.87010803 167.47571121 58.87302856 166.24927399 58.8760376 164.985672 C58.88365359 162.32006372 58.89488512 159.65475535 58.91217041 156.98921967 C58.93925125 152.76929176 58.95101195 148.5494059 58.96044922 144.32940674 C58.98452988 134.60461635 59.02856479 124.87993542 59.07290649 115.15522003 C59.11332042 106.25172895 59.1494605 97.34827563 59.16933632 88.44471192 C59.17926612 84.25536262 59.19893432 80.06620911 59.22619629 75.87693834 C59.2447097 72.64812559 59.25016728 69.41928368 59.2578125 66.19042969 C59.27331146 64.46168358 59.27331146 64.46168358 59.28912354 62.69801331 C59.29027056 53.96208561 58.72202612 46.76190766 53.0625 39.6875 C48.05401901 34.89677905 44.14614598 33.0472587 37.3125 32.25 C30.92358364 32.42200929 25.12129302 35.68149655 20.625 40.0625 C16.02002952 47.7988504 15.63666095 53.68569724 15.69360352 62.62768555 C15.68782224 64.61053942 15.68203826 66.59339329 15.67615211 68.57624686 C15.67267854 70.69634367 15.67650825 72.81631664 15.68237495 74.93640709 C15.69399658 79.36141182 15.68176483 83.78615648 15.66575623 88.21113586 C15.62963463 99.19644634 15.62333556 110.18174976 15.62585449 121.16711426 C15.6275652 129.71631909 15.62047527 138.26531039 15.58587593 146.81445533 C15.56907735 151.21323762 15.57087889 155.61149881 15.58669865 160.01027906 C15.59384889 163.38543522 15.57526885 166.76036721 15.56079102 170.13549805 C15.57053452 171.35376785 15.58027802 172.57203766 15.59031677 173.82722473 C15.57595078 175.49892227 15.57595078 175.49892227 15.56129456 177.20439148 C15.56150384 178.17240031 15.56171312 179.14040915 15.56192875 180.13775158 C14.91247134 183.45344576 13.68986001 184.62295383 11.0625 186.6875 C7.06792512 187.77692951 4.98551513 188.10887647 1.1875 186.375 C-0.9375 184.6875 -0.9375 184.6875 -1.9375 182.6875 C-2.03699265 180.70597772 -2.07095138 178.72105848 -2.07553101 176.73704529 C-2.08098434 175.46835098 -2.08643768 174.19965668 -2.09205627 172.89251709 C-2.09317615 171.47839361 -2.09422665 170.06427007 -2.09521484 168.65014648 C-2.09988212 167.1669347 -2.10502554 165.68372435 -2.11061096 164.20051575 C-2.12190335 161.00079418 -2.13033222 157.801082 -2.13673019 154.60134697 C-2.14740544 149.53693545 -2.16765106 144.47259087 -2.18984985 139.40821838 C-2.25178346 125.00484295 -2.30572474 110.60147058 -2.33886719 96.19799805 C-2.35724235 88.24725596 -2.38621832 80.29662518 -2.4268719 72.34596497 C-2.44790077 68.13985515 -2.46339323 63.93388541 -2.46567917 59.72772026 C-2.4678348 55.76565411 -2.48379685 51.80387912 -2.51006889 47.84190178 C-2.5172298 46.39278268 -2.51937852 44.94362817 -2.51596642 43.49449539 C-2.49888395 34.85527223 -2.53632271 26.76773949 -7.48046875 19.3828125 C-12.6626192 14.43453582 -17.26609841 12.15476929 -24.375 11.25 C-32.30896722 12.22434685 -37.37754819 15.47800545 -42.52734375 21.4921875 Z " transform="translate(299.9375,59.3125)"/>
</svg>`;

const CSS_ID = "RaiseHand-Styles";

function compositeHandOntoVideoStream(originalStream, videoConstraints, queuePosition) {
  const videoTrack = originalStream.getVideoTracks()[0];
  if (!videoTrack) return Promise.resolve(originalStream);

  const stream = new MediaStream(originalStream.getTracks());
  const inputVideo = document.createElement("video");
  inputVideo.srcObject = new MediaStream([videoTrack]);
  inputVideo.muted = true;
  inputVideo.playsInline = true;
  inputVideo.autoplay = true;
  inputVideo.setAttribute("playsinline", "");
  inputVideo.style.cssText = "position:absolute;width:0;height:0;opacity:0;pointer-events:none;";

  return new Promise((resolve) => {
    function tryStart() {
      const w = inputVideo.videoWidth;
      const h = inputVideo.videoHeight;
      if (!w || !h) return;
      inputVideo.onloadedmetadata = null;
      inputVideo.onloadeddata = null;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      const handImg = new Image();
      handImg.crossOrigin = "anonymous";
      const svgBlob = new Blob([HAND_SVG], { type: "image/svg+xml" });
      handImg.src = URL.createObjectURL(svgBlob);

      let rafId = null;
      const draw = () => {
        if (inputVideo.readyState >= 2) {
          ctx.drawImage(inputVideo, 0, 0, w, h);
          if (handImg.complete && handImg.naturalWidth) {
            const handSize = Math.min(w, h) * 0.4;
            const x = (w - handSize) / 2 + handSize * 0.08;
            const y = (h - handSize) / 2 - handSize * 0.08;
            const cx = x + handSize / 2;
            // Badge (blue circle) position in bottom-right of the hand
            const badgeRadius = handSize * 0.18;
            const badgeX = x + handSize * 0.78;
            const badgeY = y + handSize * 0.78;
            const numX = badgeX;
            const numY = badgeY;
            ctx.shadowColor = "rgba(0,0,0,0.85)";
            ctx.shadowBlur = 12;
            ctx.save();
            ctx.translate(cx, y + handSize / 2);
            ctx.scale(-1, 1);
            ctx.translate(-cx, -(y + handSize / 2));
            ctx.drawImage(handImg, x, y, handSize, handSize);
            // Draw blue circular badge under the number
            const grad = ctx.createRadialGradient(
              badgeX - badgeRadius * 0.3,
              badgeY - badgeRadius * 0.3,
              badgeRadius * 0.2,
              badgeX,
              badgeY,
              badgeRadius
            );
            grad.addColorStop(0, "#6ae0ff");
            grad.addColorStop(1, "#1e7cff");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = Math.max(2, badgeRadius * 0.14);
            ctx.strokeStyle = "rgba(255,255,255,0.9)";
            ctx.stroke();
            ctx.restore();
            ctx.shadowBlur = 0;
            if (queuePosition != null && queuePosition >= 1) {
              const fontSize = Math.max(18, handSize * 0.5);
              ctx.font = `bold ${fontSize}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.shadowColor = "rgba(0,0,0,0.95)";
              ctx.shadowBlur = 6;
              ctx.strokeStyle = "rgba(0,0,0,0.6)";
              ctx.lineWidth = Math.max(2, fontSize * 0.12);
              // Mirror number to match mirrored hand (Discord/video can mirror preview)
              ctx.save();
              ctx.translate(numX, numY);
              ctx.scale(-1, 1);
              ctx.translate(-numX, -numY);
              ctx.strokeText(String(queuePosition), numX, numY);
              ctx.fillStyle = "white";
              ctx.fillText(String(queuePosition), numX, numY);
              ctx.restore();
              ctx.shadowBlur = 0;
            }
          }
        }
        rafId = requestAnimationFrame(draw);
      };

      handImg.onload = () => {
        document.body.appendChild(inputVideo);
        inputVideo.play().catch(() => {});
        const fps = 30;
        const outputStream = canvas.captureStream(fps);
        draw();
        stream.removeTrack(videoTrack);
        const compositeTrack = outputStream.getVideoTracks()[0];
        if (compositeTrack) {
          if (videoTrack.label) compositeTrack.label = videoTrack.label;
          stream.addTrack(compositeTrack);
        }
        compositeTrack.addEventListener("ended", () => {
          if (rafId != null) cancelAnimationFrame(rafId);
          inputVideo.srcObject = null;
          inputVideo.remove();
          try { URL.revokeObjectURL(handImg.src); } catch (_) {}
        });
        videoTrack.stop();
        resolve(stream);
      };
      handImg.onerror = () => {
        inputVideo.remove();
        try { URL.revokeObjectURL(handImg.src); } catch (_) {}
        resolve(originalStream);
      };
    }

    inputVideo.onloadedmetadata = tryStart;
    inputVideo.onloadeddata = tryStart;
    inputVideo.play().catch(() => {});
  });
}

function addOverlayStyles() {
  if (document.getElementById(CSS_ID)) return;
  const css = `
    .raisehand-overlay-wrap {
      position: absolute !important;
      inset: 0 !important;
      pointer-events: none !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 9999 !important;
    }
    .raisehand-overlay-wrap .raisehand-icon {
      position: relative !important;
      width: 48% !important;
      height: auto !important;
      max-width: 220px !important;
      color: white !important;
      filter: drop-shadow(0 3px 12px rgba(0,0,0,0.85)) drop-shadow(0 1px 3px rgba(0,0,0,0.5)) !important;
      transform: translate(6%, -6%) scaleX(-1) !important;
    }
    .raisehand-overlay-wrap .raisehand-badge {
      position: absolute !important;
      right: -4% !important;
      bottom: -4% !important;
      width: 34% !important;
      aspect-ratio: 1 / 1 !important;
      border-radius: 999px !important;
      background: radial-gradient(circle at 30% 20%, #6ae0ff, #1e7cff) !important;
      box-shadow: 0 0 10px rgba(0,0,0,0.9), 0 0 22px rgba(64,156,255,0.95) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    .raisehand-overlay-wrap .raisehand-queue-num {
      position: static !important;
      transform: none !important;
      font: bold 2.6em sans-serif !important;
      color: white !important;
      text-shadow: 0 0 6px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7) !important;
      pointer-events: none !important;
    }
  `;
  BdApi.DOM.addStyle(CSS_ID, css);
}

function createHandOverlayEl(queuePosition) {
  const wrap = document.createElement("div");
  wrap.className = "raisehand-overlay-wrap";
  wrap.setAttribute("data-raisehand", "true");
  const icon = document.createElement("div");
  icon.className = "raisehand-icon";
  icon.innerHTML = HAND_SVG;
  if (queuePosition != null && queuePosition >= 1) {
    const badge = document.createElement("div");
    badge.className = "raisehand-badge";
    const numEl = document.createElement("span");
    numEl.className = "raisehand-queue-num";
    numEl.textContent = String(queuePosition);
    badge.appendChild(numEl);
    icon.appendChild(badge);
  }
  wrap.appendChild(icon);
  return wrap;
}

module.exports = class RaiseHand {
  constructor() {
    this.originalGetUserMedia = null;
    this.getUserMediaWrapper = null;
    this.observer = null;
    this.messageObserver = null;
    this.overlays = new Set();
    this.handVisible = false;
    this.queuePosition = null;
  }

  setHandVisible(visible, position) {
    if (visible) {
      this.queuePosition = position != null ? position : this.queuePosition;
      if (this.handVisible) this.removeAllOverlays();
      this.handVisible = true;
      this.scanVideos();
    } else {
      this.handVisible = false;
      this.queuePosition = null;
      this.removeAllOverlays();
    }
  }

  removeAllOverlays() {
    this.overlays.forEach((el) => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    this.overlays.clear();
    document.querySelectorAll("[data-raisehand-attached]").forEach((el) => el.removeAttribute("data-raisehand-attached"));
  }

  tryAttachOverlayToVideo(video) {
    if (!this.handVisible || !video || !video.parentElement || video.getAttribute("data-raisehand-attached") === "true") return;
    const parent = video.parentElement;
    if (parent.querySelector(".raisehand-overlay-wrap")) return;
    const pos = getComputedStyle(parent).position;
    if (pos === "static") parent.style.position = "relative";
    const overlay = createHandOverlayEl(this.queuePosition);
    parent.appendChild(overlay);
    video.setAttribute("data-raisehand-attached", "true");
    this.overlays.add(overlay);
  }

  scanVideos() {
    if (!this.handVisible) return;
    const app = document.getElementById("app-mount");
    if (!app) return;
    app.querySelectorAll("video").forEach((v) => this.tryAttachOverlayToVideo(v));
  }

  getFullMessageText(node) {
    const MAX_SINGLE_MSG = 550;
    let n = node;
    let best = n.nodeType === Node.TEXT_NODE ? n.textContent : (n.textContent || "");
    for (let i = 0; i < 6 && n; i++) {
      const t = n.nodeType === Node.TEXT_NODE ? n.textContent : (n.textContent || "");
      if (!t) { n = n.parentElement; continue; }
      if (t.length > MAX_SINGLE_MSG) break;
      if (t.includes("RaiseHand")) best = t;
      n = n.parentElement;
    }
    return best;
  }


  checkNodeForMarkers(node) {
    const text = this.getFullMessageText(node);
    if (typeof text !== "string" || !text) return;
    const hasShow = text.includes(MARKER_SHOW_PREFIX);
    const hasLower = text.includes(MARKER_LOWER);
    const hasPos = text.includes(MARKER_POS_PREFIX);
    if (hasShow && hasLower && text.length > 200) {
      const lastShow = text.lastIndexOf(MARKER_SHOW_PREFIX);
      const lastLower = text.lastIndexOf(MARKER_LOWER);
      if (lastShow > lastLower) {
        const position = parseShowMarker(text);
        this.setHandVisible(true, position);
      } else this.setHandVisible(false);
      return;
    }
    if (hasShow) {
      const position = parseShowMarker(text);
      this.setHandVisible(true, position);
    }
    if (hasLower) this.setHandVisible(false);
    if (this.handVisible && text.length < 300 && (text.includes("You've been removed from the speaking queue") || text.includes("Hand lowered"))) this.setHandVisible(false);
    if (hasPos) {
      const posMap = parsePosMarker(text);
      if (posMap !== null) {
        if (posMap.size === 0) this.setHandVisible(false);
        else {
          const myId = getCurrentUserId();
          if (myId) {
            if (posMap.has(myId)) this.setHandVisible(true, posMap.get(myId));
            else this.setHandVisible(false);
          }
        }
      }
    }
  }

  observeMessages() {
    const self = this;
    function scanTree(node) {
      if (!node) return;
      self.checkNodeForMarkers(node);
      if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
        node.childNodes.forEach(scanTree);
      }
    }
    const onMutations = (mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          scanTree(node);
        }
      }
    };
    this.messageObserver = new MutationObserver(onMutations);
    const opts = { childList: true, subtree: true, characterData: true, characterDataOldValue: false };
    const app = document.getElementById("app-mount");
    if (app) this.messageObserver.observe(app, opts);
    if (document.body && document.body !== app) this.messageObserver.observe(document.body, opts);
  }

  start() {
    addOverlayStyles();
    this.observeMessages();
    const app = document.getElementById("app-mount");
    if (app) {
      this.observer = new MutationObserver(() => this.scanVideos());
      this.observer.observe(app, { childList: true, subtree: true });
    }

    const self = this;
    const dm = navigator.mediaDevices;
    if (!dm) return;
    this.originalGetUserMedia = dm.getUserMedia.bind(dm);
    this.getUserMediaWrapper = function (constraints) {
      return self.originalGetUserMedia(constraints).then((stream) => {
        if (!self.handVisible || !constraints || !constraints.video) return stream;
        return compositeHandOntoVideoStream(stream, constraints.video, self.queuePosition);
      });
    };
    try {
      Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
        configurable: true,
        enumerable: true,
        get: function () { return self.getUserMediaWrapper; },
        set: function () {}
      });
    } catch (_) {
      navigator.mediaDevices.getUserMedia = this.getUserMediaWrapper;
    }
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.messageObserver) {
      this.messageObserver.disconnect();
      this.messageObserver = null;
    }
    this.removeAllOverlays();
    BdApi.DOM.removeStyle(CSS_ID);

    if (this.originalGetUserMedia && navigator.mediaDevices) {
      try {
        Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
          configurable: true,
          enumerable: true,
          value: this.originalGetUserMedia
        });
      } catch (_) {
        navigator.mediaDevices.getUserMedia = this.originalGetUserMedia;
      }
      this.originalGetUserMedia = null;
      this.getUserMediaWrapper = null;
    }
  }
};
