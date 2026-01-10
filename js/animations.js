/**
 * js/animations.js
 * Visual Animations (Sparse Sensing, Robotics, Edge AI, Micro-gestures).
 * Performance Optimized: Uses IntersectionObserver to pause loops when off-screen.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* --- COMMON UTILS --- */
    const animCommon = {
        colorMain: '#111111',
        colorAccent: '#2563EB',

        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

        /**
         * SETUP CANVAS with IntersectionObserver
         * Uses FIXED design dimensions to prevent distortion on resize/scroll.
         * CSS handles scaling the canvas to fit the container.
         */
        setupCanvas: function (id, drawFn, designWidth = 300, designHeight = 225) {
            const cvs = document.getElementById(id);
            if (!cvs) return;

            const ctx = cvs.getContext('2d', { alpha: true });
            let animationFrameId;
            let isVisible = false;

            // Fixed design dimensions - never change
            const w = designWidth;
            const h = designHeight;

            // Size canvas once at initialization (with DPR for sharpness)
            const dpr = window.devicePixelRatio || 1;
            cvs.width = w * dpr;
            cvs.height = h * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            // Animation Loop
            function loop() {
                if (!isVisible) return;
                ctx.clearRect(0, 0, w, h);
                drawFn(ctx, w, h);
                animationFrameId = requestAnimationFrame(loop);
            }

            // Observer to toggle loop
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (!isVisible) {
                            isVisible = true;
                            loop();
                        }
                    } else {
                        isVisible = false;
                        if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    }
                });
            }, { threshold: 0.0, rootMargin: "50px" });

            observer.observe(cvs);
        }
    };


    /* --- 1. SPARSE SENSING ANIMATION --- */
    (function () {
        const dots = [];
        for (let x = 0; x < 6; x++) for (let y = 0; y < 6; y++) {
            dots.push({ x, y, isSurvivor: (x === 0 && y === 0) || (x === 5 && y === 0) || (x === 2 && y === 3) || (x === 0 && y === 5) || (x === 5 && y === 5) });
        }
        const drawChip = (ctx, x, y, size, color, alpha) => {
            ctx.save(); ctx.globalAlpha = alpha; ctx.translate(Math.round(x), Math.round(y));
            ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
            ctx.strokeRect(-size / 2, -size / 2, size, size);
            const pinLen = size * 0.25; const spacing = size * 0.25;
            ctx.beginPath();
            for (let i = -1; i <= 1; i++) {
                const o = i * spacing;
                ctx.moveTo(-size / 2, o); ctx.lineTo(-size / 2 - pinLen, o);
                ctx.moveTo(size / 2, o); ctx.lineTo(size / 2 + pinLen, o);
                ctx.moveTo(o, -size / 2); ctx.lineTo(o, -size / 2 - pinLen);
                ctx.moveTo(o, size / 2); ctx.lineTo(o, size / 2 + pinLen);
            }
            ctx.stroke(); ctx.restore();
        };

        animCommon.setupCanvas('anim-sensing', (ctx, w, h) => {
            const space = w / 9.5;
            const padX = (w - (5 * space)) / 2;
            const padY = (h - (5 * space)) / 2;
            const cycleT = (Date.now() / 9000) % 1;
            dots.forEach(d => {
                let alpha = 1.0, color = animCommon.colorMain, size = 8.4;
                if (d.isSurvivor) {
                    if (cycleT > 0.2 && cycleT <= 0.85) {
                        const p = Math.min(1, (cycleT - 0.2) / 0.3); const e = animCommon.easeInOutCubic(p);
                        color = `rgb(${17 + (37 - 17) * e}, ${17 + (99 - 17) * e}, ${17 + (235 - 17) * e})`;
                        size = 8.4 + e * 4.2;
                    } else if (cycleT > 0.85) {
                        const p = (cycleT - 0.85) / 0.15; const e = animCommon.easeInOutCubic(1 - p);
                        color = `rgb(${17 + (37 - 17) * e}, ${17 + (99 - 17) * e}, ${17 + (235 - 17) * e})`;
                        size = 8.4 + e * 4.2;
                    }
                } else {
                    if (cycleT > 0.45 && cycleT <= 0.85) alpha = 1 - animCommon.easeInOutCubic(Math.min(1, (cycleT - 0.45) / 0.3));
                    else if (cycleT > 0.85) alpha = animCommon.easeInOutCubic((cycleT - 0.85) / 0.15);
                }
                drawChip(ctx, padX + d.x * space, padY + d.y * space, size, color, alpha);
            });
        });
    })();


    /* --- 2. ROBOTICS ANIMATION --- */
    (function () {
        animCommon.setupCanvas('anim-robotics', (ctx, w, h) => {
            const timeMs = Date.now(), cycleLength = 20000;
            const cycle = (timeMs % cycleLength) / cycleLength;
            const state = Math.floor(cycle * 3), stateProg = (cycle * 3) % 1;
            const time = timeMs / 1000, cx = w / 2;
            const drawRobot = (lHand, rHand, aW, state) => {
                ctx.save();
                const neck = { x: cx + Math.sin(time * 0.5) * 3, y: h * 0.4 + Math.cos(time * 0.3) * 1.5 };
                const shouldersW = 44, shoulderY = neck.y + 14;
                ctx.fillStyle = "#fff"; ctx.strokeStyle = animCommon.colorMain; ctx.lineWidth = 2.0;
                ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(neck.x - shouldersW, shoulderY - 10, shouldersW * 2, 34, 10); else ctx.rect(neck.x - shouldersW, shoulderY - 10, shouldersW * 2, 34);
                ctx.fill(); ctx.stroke();
                ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(neck.x, shoulderY); ctx.lineTo(cx, h * 0.82); ctx.stroke();
                ctx.fillStyle = "#fff"; ctx.lineWidth = 2.0;
                ctx.beginPath(); ctx.ellipse(neck.x, neck.y - 20, 17, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                const drawArm = (sX, sY, target, isRight) => {
                    const L1 = 38, L2 = 38;
                    const dx = target.x - sX, dy = target.y - sY;
                    const dist = Math.sqrt(dx * dx + dy * dy), reach = Math.min(dist, (L1 + L2) * 0.98);
                    const angle = Math.atan2(dy, dx), cosA = (L1 * L1 + reach * reach - L2 * L2) / (2 * L1 * reach);
                    const a1 = angle + (isRight ? -1 : 1) * Math.acos(Math.max(-1, Math.min(1, cosA)));
                    const elbow = { x: sX + Math.cos(a1) * L1, y: sY + Math.sin(a1) * L1 };
                    ctx.save(); ctx.strokeStyle = animCommon.colorMain; ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.globalAlpha = 0.8;
                    ctx.beginPath(); ctx.moveTo(sX, sY); ctx.lineTo(elbow.x, elbow.y); ctx.lineTo(target.x, target.y); ctx.stroke();
                    ctx.globalAlpha = 1.0; ctx.lineWidth = 2.0; ctx.fillStyle = "#fff";
                    [{ x: sX, y: sY }, elbow].forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
                    ctx.beginPath(); ctx.arc(target.x, target.y, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
                };
                drawArm(neck.x - shouldersW + 6, shoulderY, lHand, false); drawArm(neck.x + shouldersW - 6, shoulderY, rHand, true);
                if (state === 0) {
                    ctx.save(); ctx.globalAlpha = aW * 0.5; ctx.setLineDash([8, 8]); ctx.strokeStyle = animCommon.colorAccent; ctx.lineWidth = 2.5;
                    ctx.beginPath(); ctx.moveTo(lHand.x + 8, lHand.y); ctx.lineTo(rHand.x - 8, rHand.y); ctx.stroke(); ctx.restore();
                }
                if (state === 1 && aW > 0.1) {
                    ctx.save(); const pulseR = 12 + Math.sin(time * 8) * 4;
                    ctx.beginPath(); ctx.arc(rHand.x, rHand.y, pulseR, 0, Math.PI * 2); ctx.strokeStyle = animCommon.colorAccent; ctx.lineWidth = 2.5; ctx.globalAlpha = aW * 0.9; ctx.stroke(); ctx.restore();
                }
                ctx.restore();
            };
            const getCoords = (s, t) => {
                if (s === 0) return { l: { x: cx - 40 - Math.sin(t * 1.2) * 20, y: h * 0.78 }, r: { x: cx + 40 + Math.sin(t * 1.2) * 20, y: h * 0.78 } };
                if (s === 1) return { l: { x: cx - 55, y: h * 0.82 }, r: { x: cx + 62, y: h * 0.48 } };
                return { l: { x: cx - 55, y: h * 0.82 }, r: { x: cx + 40, y: h - 45 } };
            };
            const transitionWindow = 0.7; const curC = getCoords(state, time), nextC = getCoords((state + 1) % 3, time);
            let lH = { ...curC.l }, rH = { ...curC.r };
            if (stateProg > (1 - transitionWindow)) {
                const e = animCommon.easeInOutCubic((stateProg - (1 - transitionWindow)) / transitionWindow);
                lH.x += (nextC.l.x - curC.l.x) * e; lH.y += (nextC.l.y - curC.l.y) * e; rH.x += (nextC.r.x - curC.r.x) * e; rH.y += (nextC.r.y - curC.r.y) * e;
            }
            drawRobot(lH, rH, (stateProg < 0.15 ? stateProg / 0.15 : (stateProg > 0.9 ? (1 - stateProg) / 0.1 : 1)), state);
        });
    })();


    /* --- 3. EDGE AI ANIMATION --- */
    (function () {
        animCommon.setupCanvas('anim-edgeai', (ctx, w, h) => {
            const time = Date.now(), loopDuration = 6500, prog = (time % loopDuration) / loopDuration;
            const layers = [3, 4, 2], lGap = 42, vGap = 20, nodeR = 5, cx = w * 0.48, cy = h / 2, nnFirstX = cx - lGap;
            const drawChannel = (startY, endY, type) => {
                const travelProg = Math.min(1, prog / 0.42);
                ctx.save(); ctx.strokeStyle = "rgba(0,0,0,0.03)"; ctx.lineWidth = 1.8; ctx.beginPath();
                for (let i = 0; i <= 40; i++) {
                    let t = i / 40, px = t * nnFirstX, py = startY + (endY - startY) * t;
                    if (type !== 'm') py += Math.sin(t * Math.PI) * 12 * (type === 't' ? -1 : 1);
                    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                }
                ctx.stroke();
                if (prog < 0.57) {
                    const absorption = Math.max(0, (prog - 0.42) / 0.15);
                    ctx.strokeStyle = "#111111"; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.beginPath();
                    for (let i = 0; i <= 20; i++) {
                        const t = absorption + (travelProg - absorption) * (i / 20);
                        let px = t * nnFirstX, py = startY + (endY - startY) * t;
                        if (type !== 'm') py += Math.sin(t * Math.PI) * 12 * (type === 't' ? -1 : 1);
                        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.globalAlpha = 1 - absorption; ctx.stroke();
                }
                ctx.restore();
            };
            drawChannel(h * 0.22, cy - vGap, 't'); drawChannel(h * 0.5, cy, 'm'); drawChannel(h * 0.78, cy + vGap, 'b');
            ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = animCommon.colorMain; ctx.lineWidth = 1.0;
            for (let l = 0; l < layers.length - 1; l++) {
                let x1 = (l - 1) * lGap, x2 = l * lGap;
                for (let i = 0; i < layers[l]; i++) {
                    let y1 = (i - (layers[l] - 1) / 2) * vGap;
                    for (let j = 0; j < layers[l + 1]; j++) {
                        let y2 = (j - (layers[l + 1] - 1) / 2) * vGap;
                        ctx.globalAlpha = (prog > 0.44 + l * 0.1 && prog < 0.54 + l * 0.1) ? 0.6 : 0.08;
                        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                    }
                }
            }
            for (let l = 0; l < layers.length; l++) {
                let lx = (l - 1) * lGap, active = prog > 0.44 + l * 0.1 && prog < 0.54 + l * 0.1;
                for (let i = 0; i < layers[l]; i++) {
                    ctx.fillStyle = animCommon.colorMain; ctx.globalAlpha = active ? 1.0 : 0.3;
                    ctx.beginPath(); ctx.arc(lx, (i - (layers[l] - 1) / 2) * vGap, nodeR + (active ? 2.0 : 0), 0, Math.PI * 2); ctx.fill();
                }
            }
            ctx.restore();
            if (prog > 0.72) {
                const outP = Math.min(1, (prog - 0.72) / 0.25); const ox = (cx + lGap + 8) + (outP * 30);
                ctx.save(); ctx.fillStyle = animCommon.colorAccent; ctx.globalAlpha = Math.sin(outP * Math.PI);
                ctx.beginPath(); ctx.rect(ox - 9, cy - 9, 18, 18); ctx.fill(); ctx.restore();
            }
        });
    })();


    /* --- 4. MICRO-GESTURES ANIMATION --- */
    (function () {
        const cycleL = 5000;
        function getHand(w, h, time) {
            const cx = w / 2, p = (time % cycleL) / cycleL;
            let tapT = 0;
            if (p < 0.35) tapT = animCommon.easeInOutCubic(p / 0.35) * 0.15;
            else if (p < 0.45) tapT = 0.15 + ((p - 0.35) / 0.1) * 0.85;
            else if (p < 0.75) tapT = 1.0;
            else tapT = 1.0 - animCommon.easeInOutCubic((p - 0.75) / 0.25);

            let fbAlpha = (p >= 0.45 && p < 0.5) ? (p - 0.45) / 0.05 : (p >= 0.5 && p < 0.75) ? 1 : (p >= 0.75 && p < 0.9) ? 1 - (p - 0.75) / 0.15 : 0;

            const wrist = { x: cx - 15, y: h - 18 };
            const buildF = (off, lens, rots) => {
                let joints = [{ x: wrist.x + off.x, y: wrist.y + off.y }];
                let ang = -Math.PI / 2;
                for (let i = 0; i < lens.length; i++) {
                    ang += (rots[i] || 0);
                    const last = joints[joints.length - 1];
                    joints.push({ x: last.x + Math.cos(ang) * lens[i], y: last.y + Math.sin(ang) * lens[i] });
                }
                return joints;
            };
            const fingers = [
                buildF({ x: -30, y: 0 }, [28, 22], [0.8, 0.4]), // Thumb
                buildF({ x: -12, y: -24 }, [32, 26, 16], [-0.15 + tapT * 0.35, 0.4 + tapT * 0.55, 0.3]), // Index
                buildF({ x: 8, y: -28 }, [38, 28, 19], [0.5, 1.2, 0.1]), // Middle
                buildF({ x: 24, y: -22 }, [26, 18, 12], [0.6, 1.2, 0.1]), // Ring
                buildF({ x: 34, y: -14 }, [18, 12, 10], [0.8, 1.2, 0.1])  // Pinky
            ];
            const targetX = fingers[1][fingers[1].length - 1].x;
            const targetY = fingers[1][fingers[1].length - 1].y;
            return { wrist, fingers, fbAlpha, targetX, targetY };
        }

        const drawBoneSegment = (ctx, p1, p2, width) => {
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            if (dist < 1) return;
            ctx.save(); ctx.translate(p1.x, p1.y); ctx.rotate(angle);
            ctx.beginPath();
            const headS = width * 1.5; const shaftW = width * 0.65;
            ctx.moveTo(0, -headS / 2); ctx.quadraticCurveTo(dist * 0.1, -headS / 2, dist * 0.3, -shaftW / 2);
            ctx.lineTo(dist * 0.7, -shaftW / 2); ctx.quadraticCurveTo(dist * 0.9, -headS / 2, dist, -headS / 2);
            ctx.lineTo(dist, headS / 2); ctx.quadraticCurveTo(dist * 0.9, headS / 2, dist * 0.7, shaftW / 2);
            ctx.lineTo(dist * 0.3, shaftW / 2); ctx.quadraticCurveTo(dist * 0.1, headS / 2, 0, headS / 2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(15,15,15,0.98)'; ctx.fill();
            ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 0.8; ctx.stroke();
            ctx.restore();
        };

        const drawFleshSilhouette = (ctx, wrist, joints, width) => {
            ctx.save(); ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.strokeStyle = 'rgba(210,210,210,0.28)'; ctx.lineWidth = width * 2.4;
            ctx.moveTo(wrist.x, wrist.y); joints.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke(); ctx.restore();
        };

        animCommon.setupCanvas('anim-gestures', (ctx, w, h) => {
            const s = getHand(w, h, Date.now());
            const drawOrder = [4, 3, 2, 1, 0];
            drawOrder.forEach(idx => drawFleshSilhouette(ctx, s.wrist, s.fingers[idx], idx === 4 ? 5.0 : idx === 0 ? 10 : 8));
            drawOrder.forEach(idx => {
                const f = s.fingers[idx]; const baseW = idx === 4 ? 5.0 : idx === 0 ? 9.5 : 8;
                drawBoneSegment(ctx, s.wrist, f[0], baseW);
                for (let i = 0; i < f.length - 1; i++) drawBoneSegment(ctx, f[i], f[i + 1], baseW * (1 - (i * 0.22)));
            });
            if (s.fbAlpha > 0.01) {
                ctx.save(); ctx.globalAlpha = s.fbAlpha;
                ctx.beginPath(); ctx.arc(s.targetX, s.targetY, 24, 0, Math.PI * 2); ctx.fillStyle = "rgba(37, 99, 235, 0.12)"; ctx.fill();
                ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(37, 99, 235, 0.4)"; ctx.beginPath(); ctx.arc(s.targetX, s.targetY, 30, 0, Math.PI * 2); ctx.stroke();
                ctx.fillStyle = animCommon.colorAccent; ctx.beginPath(); ctx.arc(s.targetX, s.targetY, 8, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        });
    })();
});
