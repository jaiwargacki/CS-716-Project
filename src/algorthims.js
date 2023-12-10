// Not needed when running in browser
//const math = require('mathjs');

// Helper functions
function orient(p1, p2, p3) {
    matrix = [[1, p1[0], p1[1]], [1, p2[0], p2[1]], [1, p3[0], p3[1]]];
    // Calculate determinant
    return math.det(matrix);
}

function rLeftOfLine(p1, p2, p3) {
    // Returns true if p3 is to the left of the line from p1 to p2
    // Returns false if p3 is to the right of the line from p1 to p2
    // Returns false if p3 is on the line from p1 to p2

    // Calculate determinant
    let determinant = orient(p1, p3, p2);
    return determinant >= 0;
}

function angleTo(p1, p2) {
    // Returns the angle from p1 to p2 in degrees
    let angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}
    
function orderPoints(points) {
    // Sort points in counter-clockwise order
    averageX = points.reduce(function (sum, point) {
        return sum + point[0];
    }, 0) / points.length;
    averageY = points.reduce(function (sum, point) {
        return sum + point[1];
    }, 0) / points.length;

    points.sort(function (a, b) {
        angleA = angleTo([averageX, averageY], a);
        angleB = angleTo([averageX, averageY], b);
        if (angleA == angleB) {
            // Sort by distance from average point
            distanceA = Math.sqrt(Math.pow(a[0] - averageX, 2) + Math.pow(a[1] - averageY, 2));
            distanceB = Math.sqrt(Math.pow(b[0] - averageX, 2) + Math.pow(b[1] - averageY, 2));
            if (distanceA > distanceB) {
                return 1;
            } else {
                return -1;
            }
        } else if (angleA > angleB) {
            return 1;
        } else {
            return -1;
        }
    }
    );

    return points;
}

function findTangents(leftHull, rightHull) {
    leftHull = orderPoints(leftHull);
    rightHull = orderPoints(rightHull).reverse();

    rightMostLeftHull = 0;
    for (let i = 1; i < leftHull.length; i++) {
        if (leftHull[i][0] > leftHull[rightMostLeftHull][0]) {
            rightMostLeftHull = i;
        }
    }
    leftMostRightHull = rightHull.length - 1;
    for (let i = rightHull.length - 2; i >= 0; i--) {
        if (rightHull[i][0] < rightHull[leftMostRightHull][0]) {
            leftMostRightHull = i;
        }
    }

    // Find upper tangent
    left = leftHull[rightMostLeftHull];
    left_pred = leftHull[(rightMostLeftHull + 1) % leftHull.length];
    left_index = rightMostLeftHull;
    right = rightHull[leftMostRightHull];
    right_suc = rightHull[(leftMostRightHull + 1) % rightHull.length];
    right_index = leftMostRightHull;
    while(true) {
        if (rightHull.length > 1) {
            while (orient(left, right, right_suc) >= 0) {
                right_index = (right_index + 1) % rightHull.length
                right = right_suc;
                right_suc = rightHull[right_index];
            }
        }
        if (leftHull.length > 1) {
            while (orient(right, left, left_pred) <= 0) {
                left_index = (left_index + 1) % leftHull.length;
                left = left_pred;
                left_pred = leftHull[left_index];
            }
        }
        if ((orient(left, right, right_suc) < 0 || rightHull.length == 1) 
            && (orient(right, left, left_pred) > 0 || leftHull.length == 1)) {
            break;
        }
    }
    upperTangent = [left, right];

    // Find lower tangent
    left = leftHull[rightMostLeftHull];
    left_suc = leftHull[(rightMostLeftHull + leftHull.length - 1) % leftHull.length];
    left_index = rightMostLeftHull;
    right = rightHull[leftMostRightHull];
    right_pred = rightHull[(leftMostRightHull + rightHull.length - 1) % rightHull.length];
    right_index = leftMostRightHull;
    while(true) {
        if (rightHull.length > 1) {
            while (orient(left, right, right_pred) <= 0) {
                right_index = (right_index + rightHull.length - 1) % rightHull.length;
                right = right_pred;
                right_pred = rightHull[right_index];
            }
        }
        if (leftHull.length > 1) {
            while (orient(right, left, left_suc) >= 0) {
                left_index = (left_index + leftHull.length - 1) % leftHull.length;
                left = left_suc;
                left_suc = leftHull[left_index];
            }
        }
        if ((orient(left, right, right_pred) > 0 || rightHull.length == 1) 
            && (orient(right, left, left_suc) < 0 || leftHull.length == 1)) {
            break;
        }
    }
    lowerTangent = [left, right];

    return [upperTangent, lowerTangent];
}

function removeDuplicatePoints(points) {
    finalHull = [];
    for (let p = 0; p < points.length; p++) {
        let duplicate = false;
        for (let q = 0; q < finalHull.length; q++) {
            if (points[p][0] == finalHull[q][0] 
                    && points[p][1] == finalHull[q][1]) {
                duplicate = true;
                break;
            }
        }
        if (!duplicate) {
            finalHull.push(points[p]);
        }
    }
    
    return finalHull;
}

function orderInitialPoints(a, b) {
    if (a[0] == b[0]) {
        return a[1] - b[1];
    }
    return a[0] - b[0];
}


// Algorithms
function bruteForce(points) {
    hull = [];

    for (let p = 0; p < points.length; p++) {
        for (let q = 0; q < points.length; q++) {
            if (p == q) {
                continue;
            }
            let valid = true;
            for (let r = 0; r < points.length; r++) {
                if (r == p || r == q) {
                    continue;
                }
                if (rLeftOfLine(points[p], points[q], points[r])) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                hull.push(points[p]);
                hull.push(points[q]);
            }
        }
    }
    if (hull.length == 0 && points.length > 0) {
        points.sort(orderInitialPoints);
        hull.push(points[0]);
        hull.push(points[points.length - 1]);
    }

    finalHull = removeDuplicatePoints(hull);
    finalHull = orderPoints(finalHull);
    return finalHull;
}

function grahamScan(points) {
    points.sort(orderInitialPoints);

    if (points.length >= 2) {
        hull = [points[0], points[1]];
    } else {
        return [];
    }

    for (let i = 2; i < points.length; i++) {
        while (hull.length >= 2 && orient(points[i], hull[hull.length - 1], 
          hull[hull.length - 2]) <= 0) {
            hull.pop();
        }
        hull.push(points[i]);
    }
    points.reverse();
    let bottomHull = [points[0], points[1]];
    for (let i = 2; i < points.length; i++) {
        while (bottomHull.length >= 2 && orient(points[i], 
          bottomHull[bottomHull.length - 1], 
          bottomHull[bottomHull.length - 2]) <= 0) {
            bottomHull.pop();
        }
        bottomHull.push(points[i]);
    }
    hull = hull.concat(bottomHull.slice(1, bottomHull.length - 1));
    return hull;
}

function divideAndConquer(points) {
    if (points.length <= 3) {
        return bruteForce(points);
    }

    points.sort(orderInitialPoints);

    const x_split = points.reduce(function (sum, point) {
            return sum + point[0];
        }, 0) / points.length;
    let leftPoints = points.filter(function (point) {
            return point[0] <= x_split;
        });
    let rightPoints = points.filter(function (point) {
            return point[0] > x_split;
        });

    if (leftPoints.length == 0) {
        return bruteForce(rightPoints);
    } else if (rightPoints.length == 0) {
        return bruteForce(leftPoints);
    }

    let leftHull = divideAndConquer(leftPoints);
    let rightHull = divideAndConquer(rightPoints);

    let tangents = findTangents(leftHull, rightHull);

    let hull = [];
    leftHull = orderPoints(leftHull);
    for (let i = leftHull.indexOf(tangents[0][0]); 
            i != leftHull.indexOf(tangents[1][0]); 
            i = (i + 1) % leftHull.length) {
        hull.push(leftHull[i]);
    }
    hull.push(tangents[1][0]);
    rightHull = orderPoints(rightHull).reverse();
    for (let i = rightHull.indexOf(tangents[0][1]); 
            i != rightHull.indexOf(tangents[1][1]); 
            i = (i + 1) % rightHull.length) {
        hull.push(rightHull[i]);
    }
    hull.push(tangents[1][1]);
    finalHull = removeDuplicatePoints(hull);
    finalHull = orderPoints(finalHull);
    for (let i = 0; i < finalHull.length; i++) {
        if (orient(finalHull[i], finalHull[(i + 1) % finalHull.length], 
                finalHull[(i + 2) % finalHull.length]) == 0) {
            finalHull.splice((i + 1) % finalHull.length, 1);
            i--;
        }
    }

    return finalHull;
}

function jarvisMarch(points) {
    points.sort(orderInitialPoints);

    const lowest = points[0];
    hull = [lowest];

    while (true) {
        p = hull[hull.length - 1];
        next = points[0];
        nextDistance = Math.sqrt(Math.pow(p[0] - next[0], 2) + 
            Math.pow(p[1] - next[1], 2));
        for (let i = 1; i < points.length; i++) {
            if (points[i][0] == p[0] && points[i][1] == p[1]) {
                continue;
            }
            if (next[0] == p[0] && next[1] == p[1]) {
                next = points[i];
                nextDistance = Math.sqrt(Math.pow(p[0] - next[0], 2) + 
                    Math.pow(p[1] - next[1], 2));
                continue;
            }
            let distance = Math.sqrt(Math.pow(p[0] - points[i][0], 2) + 
                Math.pow(p[1] - points[i][1], 2));
            if (orient(p, next, points[i]) == 0 && distance > nextDistance) {
                next = points[i];
                nextDistance = distance;
            } else if (orient(p, next, points[i]) > 0) {
                next = points[i];
                nextDistance = distance;
            }
        }

        if (next[0] == lowest[0] && next[1] == lowest[1]) {
            break;
        }

        hull.push(next);
    }

    return hull;
}

// Testing
function validateAlgorithm(algorithm, points, expectedHull) {
    // Returns true if the algorithm returns the expected hull
    // Returns false otherwise

    let hull = algorithm(points);

    if (hull.length != expectedHull.length) {
        console.error(hull)
        console.error("Expected hull length: " + expectedHull.length + ", actual hull length: " + hull.length);
        return false;
    }

    // Sort hulls
    hull.sort();
    expectedHull.sort();

    for (let i = 0; i < hull.length; i++) {
        if (hull[i][0] != expectedHull[i][0] || hull[i][1] != expectedHull[i][1]) {
            console.error("Expected: " + expectedHull[i][0] + ", " + expectedHull[i][1] + " Got: " + hull[i][0] + ", " + hull[i][1] + " at index " + i);
            return false;
        }
    }

    return true;
}

function test() {
    // Set up points and hulls for testing
    testCases = []

    // Test case from assignment 1
    points1 = [[10, 4], [7, 3], [8, 1], [6, -1], [9, -2], [11, -1], [12, 0], [15, 1], [14, 3], [13, 3]];
    hull1 = [[6, -1], [9, -2], [15, 1], [14, 3], [10, 4], [7, 3]];

    testCases.push([points1, hull1]);

    // Test cases from https://stackoverflow.com/questions/482278/test-case-data-for-convex-hull
    points2 = [[7, 7], [7, -7], [-7, -7], [-7, 7], [9, 0], [-9, 0], [0, 9], [0, -9]];
    points3 = [[7, 7], [7, -7], [-7, -7], [-7, 7], [9, 0], [-9, 0], [0, 9], [0, -9], [0, 0], [1, 2], [-2, 1], [-1, -1], [3, 4], [4, 3], [-5, 4], [6, 5]];
    points4 = [[0, 0], [1, 2], [-2, 1], [-1, -1], [3, 4], [4, 3], [-5, 4], [6, 5], [7, 7], [7, -7], [-7, -7], [-7, 7], [9, 0], [-9, 0], [0, 9], [0, -9], [-8, 0], [8, 0], [-7, 0], [7, 0], [-6, 0], [6, 0], [-5, 0], [5, 0], [-4, 0], [4, 0], [-3, 0], [3, 0], [-2, 0], [2, 0], [-1, 0], [1, 0], [0, -8], [0, 8], [0, -7], [0, 7], [0, -6], [0, 6], [0, -5], [0, 5], [0, -4], [0, 4], [0, -3], [0, 3], [0, -2], [0, 2], [0, -1], [0, 1], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [1, -1], [2, -2], [3, -3], [4, -4], [5, -5], [6, -6], [-1, 1], [-2, 2], [-3, 3], [-4, 4], [-5, 5], [-6, 6], [-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6]];
    hull2 = [[0, -9], [7, -7], [9, 0], [7, 7], [0, 9], [-7, 7], [-9, 0], [-7, -7]];

    testCases.push([points2, hull2]);
    testCases.push([points3, hull2]);
    testCases.push([points4, hull2]);

    for (let i = 0; i < testCases.length; i++) {
        let points = testCases[i][0];
        let hull = testCases[i][1];

        algorithms = [["Brute Force", bruteForce], ["Graham Scan", grahamScan], ["Divide and Conquer", divideAndConquer], ["Jarvis March", jarvisMarch]];

        for (let j = 0; j < algorithms.length; j++) {
            if (validateAlgorithm(algorithms[j][1], points, hull)) {
                console.log(algorithms[j][0] + " Test " + (i + 1) + " passed");
            } else {
                console.log(algorithms[j][0] + " Test " + (i + 1) + " failed");
            }
        }
    }
}

// Run tests
test();

// Start up app
points = [];
openTab("run");

inlineNotes = {}

// Do you run these functions? 
runBruteForce = true;
runGrahamScan = true;
runDivideAndConquer = true;
runJarvisMarch = true;

walkthroughAlgorithm = undefined;

// HTML functions
function openTab(mode) {
    document.getElementById("step").style.display = "none";
    document.getElementById("run").style.display = "none";
    document.getElementById("step-tab").classList.remove("bar-item-active");
    document.getElementById("run-tab").classList.remove("bar-item-active");

    document.getElementById(mode).style.display = "block";
    document.getElementById(mode + "-tab").classList.add("bar-item-active");

    if (mode == "run") {
        runBruteForce = true;
        runGrahamScan = true;
        runDivideAndConquer = true;
        runJarvisMarch = true;
        document.getElementById("bruteForce").classList.remove("toggled");
        document.getElementById("grahamScan").classList.remove("toggled");
        document.getElementById("divideAndConquer").classList.remove("toggled");
        document.getElementById("jarvisMarch").classList.remove("toggled");
        walkthroughAlgorithm = undefined;
        document.getElementById("runConvexHullButton").disabled = false;
    } else {
        runBruteForce = false;
        runGrahamScan = false;
        runDivideAndConquer = false;
        runJarvisMarch = false;
        document.getElementById("runConvexHullButton").disabled = true;
        changeAlgorithm();
    }
}

function toggle(algorithmName) {
    if (algorithmName == "bruteForce") {
        runBruteForce = !runBruteForce;
    } else if (algorithmName == "grahamScan") {
        runGrahamScan = !runGrahamScan;
    } else if (algorithmName == "divideAndConquer") {
        runDivideAndConquer = !runDivideAndConquer;
    } else if (algorithmName == "jarvisMarch") {
        runJarvisMarch = !runJarvisMarch;
    }

    toggled = document.getElementById(algorithmName).classList.contains("toggled");
    if (!toggled) {
        document.getElementById(algorithmName).classList.add("toggled");
    } else {
        document.getElementById(algorithmName).classList.remove("toggled");
    }
}
    

function runHull(func) {
    const start_time = performance.now();
    // Run hull on points, color hull points blue and connect them with lines
    hull = func(points);
    drawHull(hull);
    return performance.now() - start_time;
}

function drawPoint(ctx, x, y, color) {
    // Draw red dot at cursor (circle)
    ctx.fillStyle = color
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
}

function drawHull(hull) {
    const ctx = document.querySelector('canvas').getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hull[0][0], hull[0][1]);
    ctx.fillStyle = "black";
    for (let i = 1; i < hull.length; i++) {
        ctx.lineTo(hull[i][0], hull[i][1]);
    }
    ctx.lineTo(hull[0][0], hull[0][1]);
    ctx.stroke();

    // Draw points
    for (let i = 0; i < points.length; i++) {
        drawPoint(ctx, points[i][0], points[i][1], '#2f60ff');
    }
    // Draw hull points
    for (let i = 0; i < hull.length; i++) {
        drawPoint(ctx, hull[i][0], hull[i][1], '#ff0000');
    }
    
}

function clearCanvas() {
    // Clears the canvas
    const ctx = document.querySelector('canvas').getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
}

function createPointOnClick(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const ctx = canvas.getContext('2d')
    drawPoint(ctx, x, y, '#2f60ff');
    // Add point to list
    points.push([x, y])
}

const canvas = document.querySelector('canvas')
canvas.addEventListener('mousedown', function(e) {
    createPointOnClick(canvas, e)
})

function addRandomPoint(n) {
    // Adds n random points to the canvas
    const ctx = document.querySelector('canvas').getContext('2d');
    for (let i = 0; i < n; i++) {
        let x = Math.floor(Math.random() * (canvas.width - 20)) + 10;
        let y = Math.floor(Math.random() * (canvas.height - 20)) + 10;
        drawPoint(ctx, x, y, '#2f60ff');
        // Add point to list
        points.push([x, y])
    }
}

function randomPoints() {
    // Get number of points to generate from id="numPoints"
    let numPoints = document.getElementById("numPoints").value;

    clearCanvas();
    addRandomPoint(numPoints);
}

function runAll() {
    if (points.length < 3) {
        alert("Not enough points to run algorithms");
        return;
    } 
    if (!runBruteForce && !runGrahamScan && !runDivideAndConquer && !runJarvisMarch) {
        if (walkthroughAlgorithm != undefined) {
            runComplete();
            return;
        }
        alert("No algorithms selected");
        return;
    }

    // Run all algorithms
    let times = [];
    times.push(runBruteForce ? runHull(bruteForce) : -1);
    times.push(runGrahamScan ? runHull(grahamScan) : -1);
    times.push(runDivideAndConquer ? runHull(divideAndConquer) : -1);
    times.push(runJarvisMarch ? runHull(jarvisMarch) : -1);

    // Create new row in table(id="timeTable")
    // Rows: numPoints, bruteForce, grahamScan, divideAndConquer, jarvisMarch
    let table = document.getElementById("timeTable");
    let row = table.insertRow(1);
    let cell = row.insertCell(0);
    cell.innerHTML = points.length;
    for (let i = 0; i < times.length; i++) {
        cell = row.insertCell(i + 1);
        if (times[i] == -1) {
            cell.innerHTML = "-";
        } else {
            cell.innerHTML = (times[i] / 1000).toFixed(3);
        }
    }
}

function changeAlgorithm() {
    // Change algorithm to the selected algorithm
    let algorithm = document.getElementById("algorithmForWalkThrough").value;
    
    // Set id=codeWalkthroughText to the code for the selected algorithm
    if (algorithm == "bruteForce") {
        walkthroughAlgorithm = bruteForce;
    } else if (algorithm == "grahamScan") {
        walkthroughAlgorithm = grahamScan;
    } else if (algorithm == "divideAndConquer") {
        walkthroughAlgorithm = divideAndConquer;
    } else if (algorithm == "jarvisMarch") {
        walkthroughAlgorithm = jarvisMarch;
    }
    document.getElementById("codeWalkthroughText").innerHTML = walkthroughAlgorithm.toString();
}

function waitForButtonClick() {
    return new Promise(resolve => {
      const button = document.getElementById('nextButton');
      button.addEventListener('click', () => {
        resolve('Button clicked');
      });
    });
  }

async function highlightLine(lineNumbers) {
    await highlightLine(lineNumbers, undefined, undefined);
}

async function highlightLine(lineNumbers, note) {
    // lineNumbers list of line numbers to highlight
    // notes list of notes to display for each line
    let code = walkthroughAlgorithm.toString();
    let lines = code.split("\n");
    let highlightedCode = "";
    for (let i = 0; i < lines.length; i++) {
        let inLineNote = inlineNotes[i];
        if (lineNumbers.includes(i)) {
            if (inLineNote != undefined) {
                highlightedCode += "<mark>" + lines[i] + "</mark>\t<span class=\"note\">" + inLineNote + "</span>\n";
            } else {
                highlightedCode += "<mark>" + lines[i] + "</mark>\n";
            }
        } else {
            if (inLineNote != undefined) {
                highlightedCode += lines[i] + "\t<span class=\"note\">" + inLineNote + "</span>\n";
            } else {
                highlightedCode += lines[i] + "\n";
            }
        }
    }
    document.getElementById("codeWalkthroughText").innerHTML = highlightedCode;

    // Update codeDescription
    if (note != undefined) {
        document.getElementById("codeDescription").innerHTML = note;
    } else {
        document.getElementById("codeDescription").innerHTML = "";
    }

    await waitForButtonClick();
}

async function bruteForceWalkthrough() {
    inlineNotes = {};
    hull = [];
    inlineNotes[1] = "hull = []";
    await highlightLine([1], "Initialize hull to empty list");
    inlineNotes[1] = undefined;

    for (let p = 0; p < points.length; p++) {
        inlineNotes = {};
        inlineNotes[3] = "p=" + p + "; " + points[p]
        await highlightLine([3], "Loop through all points. Note the nested for loops");
        for (let q = 0; q < points.length; q++) {
            inlineNotes = {};
            inlineNotes[3] = "p=" + p + "; " + points[p]
            inlineNotes[4] = "q=" + q + "; " + points[q]
            await highlightLine([4], "Loop through all points. Note the nested for loops");
            await highlightLine([5], "Skip the pairing of points if they are the same point");
            if (p == q) {
                await highlightLine([6]);
                continue;
            }
            let valid = true;
            await highlightLine([8], "Initialize valid to true");
            for (let r = 0; r < points.length; r++) {
                await highlightLine([9], "Loop through all points. Note the nested for loops");
                await highlightLine([10], "Skip the pairing of points if any of them are the same point");
                if (r == p || r == q) {
                    await highlightLine([11], "Skip the pairing of points if any of them are the same point");
                    continue;
                }
                inlineNotes[13] = "" + rLeftOfLine(points[p], points[q], points[r]);
                await highlightLine([13], "Check if point r is to the left of the line from point p to point q");
                if (rLeftOfLine(points[p], points[q], points[r])) {
                    valid = false;
                    await highlightLine([14], "If point r is to the left of the line from point p to point q, then the pairing of points p and q is not valid");
                    await highlightLine([15], "Break out of the loop");
                    inlineNotes[13] = undefined;
                    break;
                }
                inlineNotes[13] = undefined;
            }
            inlineNotes[18] = "valid=" + valid;
            await highlightLine([18], "Check if the pairing of points p and q is valid");
            if (valid) {
                inlineNotes[19] = "points[p]=" + points[p];
                hull.push(points[p]);
                drawHull(hull);
                await highlightLine([19], "Add point p to the hull");
                inlineNotes[20] = "points[q]=" + points[q];
                hull.push(points[q]);
                drawHull(hull);
                await highlightLine([20], "Add point q to the hull");
            }
        }
    }
    inlineNotes = {};
    inlineNotes[23] = "hull.length=" + hull.length;
    await highlightLine([24], "Check if the hull is empty. This is the case if there are no points");
    if (hull.length == 0 && points.length > 0) {
        points.sort(orderInitialPoints);
        await highlightLine([25], "If the hull is empty, add the leftmost and rightmost points to the hull");
        hull.push(points[0]);
        drawHull(hull);
        await highlightLine([26], "If the hull is empty, add the leftmost and rightmost points to the hull");
        hull.push(points[points.length - 1]);
        drawHull(hull);
        await highlightLine([27], "If the hull is empty, add the leftmost and rightmost points to the hull");
    }
    inlineNotes = {};

    finalHull = removeDuplicatePoints(hull);
    inlineNotes[30] = "finalHull=" + finalHull.length;
    drawHull(finalHull);
    await highlightLine([30], "Remove duplicate points from the hull");
    finalHull = orderPoints(finalHull);
    drawHull(finalHull)
    await highlightLine([31], "Order the points in the hull");
    await highlightLine([32], "Return the hull");
    inlineNotes = {};
    await highlightLine([-1]);

}

async function grahamScanWalkthrough() {
    inlineNotes = {};
    points.sort(orderInitialPoints);
    await highlightLine([1], "Sort the points by x coordinate");

    inlineNotes[2] = "points.length=" + points.length;
    await highlightLine([3]);
    if (points.length >= 2) {
        hull = [points[0], points[1]];
        drawHull(hull);
        await highlightLine([4], "If there are at least 2 points, initialize the hull to the first 2 points");
    } else {
        await highlightLine([6], "If there are less than 2 points, return an empty hull");
        inlineNotes = {};
        return [];
    }
    inlineNotes = {};

    for (let i = 2; i < points.length; i++) {
        inlineNotes = {};
        inlineNotes[9] = "i=" + i + "; " + points[i];
        await highlightLine([9], "Loop through the remaining points");
        await highlightLine([10,11], "Check if the point is to the left of the line from the last point in the hull to the second to last point in the hull");
        while (hull.length >= 2 && orient(points[i], hull[hull.length - 1], 
            hull[hull.length - 2]) <= 0) {
            hull.pop();
            drawHull(hull);
            await highlightLine([12], "If the point is to the left of the line from the last point in the hull to the second to last point in the hull, remove the last point in the hull");
        }
        hull.push(points[i]);
        drawHull(hull);
        await highlightLine([14], "Add the current point to the hull");
    }
    inlineNotes = {};
    points.reverse();
    await highlightLine([16], "Reverse the points in preparation for the bottom hull");
    let bottomHull = [points[0], points[1]];
    await highlightLine([17], "Initialize the bottom hull to the first 2 points");
    for (let i = 2; i < points.length; i++) {
        inlineNotes = {};
        inlineNotes[18] = "i=" + i + "; " + points[i];
        await highlightLine([18], "Loop through the remaining points");
        await highlightLine([19,20,21], "Check if the point is to the left of the line from the last point in the hull to the second to last point in the hull");
        while (bottomHull.length >= 2 && orient(points[i], 
            bottomHull[bottomHull.length - 1], 
            bottomHull[bottomHull.length - 2]) <= 0) {
            bottomHull.pop();
            drawHull(hull.concat(bottomHull));
            await highlightLine([22], "If the point is to the left of the line from the last point in the hull to the second to last point in the hull, remove the last point in the hull");
        }
        bottomHull.push(points[i]);
        drawHull(hull.concat(bottomHull));
        await highlightLine([24], "Add the current point to the hull");
    }
    inlineNotes = {};
    hull = hull.concat(bottomHull.slice(1, bottomHull.length - 1));
    drawHull(hull);
    await highlightLine([26], "Combine the top and bottom hulls");
    await highlightLine([27], "Return the hull");
    await highlightLine([-1]);
}

async function divideAndConquerWalkthrough(points) {
    inlineNotes = {};
    inlineNotes[1] = "points.length=" + points.length;
    await highlightLine([1], "Check if there are less than 3 points");
    if (points.length <= 3) {
        await highlightLine([2], "If there are less than 3 points, return the hull");
        return bruteForce(points);
    }

    points.sort(orderInitialPoints);
    await highlightLine([5], "Sort the points by x coordinate");

    const x_split = points.reduce(function (sum, point) {
        return sum + point[0];
    }, 0) / points.length;
    inlineNotes[7] = "x_split=" + x_split;
    await highlightLine([7,8,9], "Find the x coordinate to split the points on");
    let leftPoints = points.filter(function (point) {
        return point[0] <= x_split;
    });
    inlineNotes[10] = "leftPoints.length=" + leftPoints.length;
    await highlightLine([10,11,12], "Split the points into left and right points");
    let rightPoints = points.filter(function (point) {
        return point[0] > x_split;
    });
    inlineNotes[13] = "rightPoints.length=" + rightPoints.length;
    await highlightLine([13,14,15], "Split the points into left and right points");

    await highlightLine([17]);
    if (leftPoints.length == 0) {
        await highlightLine([18]);
        return bruteForce(rightPoints);
    } else {
        await highlightLine([19]);
        if (rightPoints.length == 0) {
            await highlightLine([20]);
            return bruteForce(leftPoints);
        }
    }

    await highlightLine([23], "Recursively call divide and conquer on the left and right points");
    let beforeRecursion = inlineNotes;
    let leftHull = await divideAndConquerWalkthrough(leftPoints);
    inlineNotes = beforeRecursion;
    inlineNotes[23] = "leftHull.length=" + leftHull.length;
    await highlightLine([24], "Recursively call divide and conquer on the left and right points");
    beforeRecursion = inlineNotes;
    let rightHull = await divideAndConquerWalkthrough(rightPoints);
    inlineNotes = beforeRecursion;
    inlineNotes[24] = "rightHull.length=" + rightHull.length;
    
    let tangents = findTangents(leftHull, rightHull);
    inlineNotes[26] = "tangents[0][0]=" + tangents[0][0] + "; tangents[0][1]=" + tangents[0][1];
    await highlightLine([26], "Find the tangents between the left and right hulls");

    let hull = [];
    await highlightLine([28], "Initialize the hull to empty list");
    leftHull = orderPoints(leftHull);
    await highlightLine([29], "Order the points in the left hull");
    for (let i = leftHull.indexOf(tangents[0][0]); 
            i != leftHull.indexOf(tangents[1][0]); 
            i = (i + 1) % leftHull.length) {
        inlineNotes[30] = "i=" + i + "; " + leftHull[i];
        await highlightLine([30,31,32], "Loop through the points in the left hull between the tangents");
        hull.push(leftHull[i]);
        drawHull(hull);
        await highlightLine([33], "Add the current point to the hull");
    }
    inlineNotes[30] = undefined;
    hull.push(tangents[1][0]);
    drawHull(hull);
    await highlightLine([35], "Add the tangent point to the hull");
    rightHull = orderPoints(rightHull).reverse();
    await highlightLine([36], "Order the points in the right hull (in reverse order by x coordinate)");
    for (let i = rightHull.indexOf(tangents[0][1]); 
            i != rightHull.indexOf(tangents[1][1]); 
            i = (i + 1) % rightHull.length) {
        inlineNotes[37] = "i=" + i + "; " + rightHull[i];
        await highlightLine([37,38,39], "Loop through the points in the right hull between the tangents");
        hull.push(rightHull[i]);
        drawHull(hull);
        await highlightLine([40], "Add the current point to the hull");
    }
    inlineNotes[37] = undefined;
    hull.push(tangents[1][1]);
    drawHull(hull);
    await highlightLine([42], "Add the tangent point to the hull");
    finalHull = removeDuplicatePoints(hull);
    drawHull(finalHull);
    await highlightLine([43], "Remove duplicate points from the hull");
    finalHull = orderPoints(finalHull);
    drawHull(finalHull);
    await highlightLine([44], "Order the points in the hull");
    for (let i = 0; i < finalHull.length; i++) {
        inlineNotes[45] = "i=" + i + "; " + finalHull[i];
        await highlightLine([45], "Remove colinear points")
        await highlightLine([46, 47], "Remove colinear points: Check if the points are colinear")
        if (orient(finalHull[i], finalHull[(i + 1) % finalHull.length], 
                finalHull[(i + 2) % finalHull.length]) == 0) {
            finalHull.splice((i + 1) % finalHull.length, 1);
            drawHull(finalHull);
            await highlightLine([48], "Remove colinear points: Remove the middle point if the points are colinear");
            i--;
            await highlightLine([49], "Remove colinear points: Decrement i to account for the removed point");
        }
    }
    inlineNotes[45] = undefined;

    await highlightLine([53], "Return the hull");
    inlineNotes = {};
    return finalHull;
}

async function jarvisMarchWalkthrough() {
    inlineNotes = {};
    inlineNotes[1] = "points.length=" + points.length;
    points.sort(orderInitialPoints);
    await highlightLine([1], "Sort the points by x coordinate");

    const lowest = points[0];
    inlineNotes[3] = "lowest=" + lowest;
    await highlightLine([3], "Initialize the lowest point to the leftmost point");
    hull = [lowest];
    drawHull(hull);
    await highlightLine([4], "Initialize the hull to the lowest point");

    await highlightLine([6], "Loop until the lowest point is reached again");
    while (true) {
        p = hull[hull.length - 1];
        inlineNotes[7] = "p=" + p;
        await highlightLine([7], "Set p to the last point in the hull");
        next = points[0];
        inlineNotes[8] = "next=" + next;
        await highlightLine([8], "Set next to the first point in the points list");
        nextDistance = Math.sqrt(Math.pow(p[0] - next[0], 2) + 
            Math.pow(p[1] - next[1], 2));
        inlineNotes[10] = "nextDistance=" + nextDistance;
        await highlightLine([9,10], "Set nextDistance to the distance between p and next");
        for (let i = 1; i < points.length; i++) {
            inlineNotes[11] = "i=" + i + "; " + points[i];
            await highlightLine([11], "Loop through the remaining points");
            await highlightLine([12], "Skip the pairing of points if current point is the same point as p");
            if (points[i][0] == p[0] && points[i][1] == p[1]) {
                await highlightLine([13], "Skip the pairing of points if current point is the same point as p");
                continue;
            }
            await highlightLine([15], "Update next if the points are the same point");
            if (next[0] == p[0] && next[1] == p[1]) {
                next = points[i];
                inlineNotes[8] = "next=" + next;
                await highlightLine([16], "Update next if the points are the same point");
                nextDistance = Math.sqrt(Math.pow(p[0] - next[0], 2) + 
                    Math.pow(p[1] - next[1], 2));
                inlineNotes[10] = "nextDistance=" + nextDistance;
                await highlightLine([17,18], "Update nextDistance if the points are the same point");
                await highlightLine([19], "Continue to the next point");
                continue;
            }
            let distance = Math.sqrt(Math.pow(p[0] - points[i][0], 2) + 
                Math.pow(p[1] - points[i][1], 2));
            inlineNotes[20] = "distance=" + distance;
            await highlightLine([21,22], "Calculate the distance between p and the current point");
            inlineNotes[22] = "orient=" + orient(p, next, points[i]);
            const descriptionOfThis = "Update next as needed. Conditions of orient being 0 and distance being > nextDistance is checked first. Then orient is checked. If orient is > 0, then the current point is to the left of the line from p to next.";
            await highlightLine([23], descriptionOfThis);
            if (orient(p, next, points[i]) == 0 && distance > nextDistance) {
                next = points[i];
                inlineNotes[8] = "next=" + next;
                await highlightLine([24], descriptionOfThis);
                nextDistance = distance;
                inlineNotes[10] = "nextDistance=" + nextDistance;
                await highlightLine([25], descriptionOfThis);
            } else {
                await highlightLine([26], descriptionOfThis);
                if (orient(p, next, points[i]) > 0) {
                    next = points[i];
                    inlineNotes[8] = "next=" + next;
                    await highlightLine([27], descriptionOfThis);
                    nextDistance = distance;
                    inlineNotes[10] = "nextDistance=" + nextDistance;
                    await highlightLine([28], descriptionOfThis);
                }
            }
            inlineNotes[22] = undefined;
        }
        inlineNotes[11] = undefined;

        await highlightLine([32], "Check if the next point is the lowest point");
        if (next[0] == lowest[0] && next[1] == lowest[1]) {
            await highlightLine([33], "If the next point is the lowest point, break out of the loop");
            break;
        }

        hull.push(next);
        drawHull(hull);
        await highlightLine([36], "Add the next point to the hull");
    }
    inlineNotes = {};
    await highlightLine([39], "Return the hull");
    await highlightLine([-1]);
}

function runComplete() {
    if (walkthroughAlgorithm == undefined) {
        alert("No algorithm selected");
        return;
    }
    if (points.length < 3) {
        alert("Not enough points to run algorithm");
        return;
    }

    // Disable runButton
    document.getElementById("runButton").disabled = true;

    // Run algorithm
    if (walkthroughAlgorithm == bruteForce) {
        bruteForceWalkthrough().then(function() {
            highlightLine([-1]);
            document.getElementById("runButton").disabled = false;
        });
    } else if (walkthroughAlgorithm == grahamScan) {
        grahamScanWalkthrough().then(function() {
            highlightLine([-1]);
            document.getElementById("runButton").disabled = false;
        });
    } else if (walkthroughAlgorithm == divideAndConquer) {
        divideAndConquerWalkthrough(points).then(function() {
            highlightLine([-1]);
            document.getElementById("runButton").disabled = false;
        });
    } else if (walkthroughAlgorithm == jarvisMarch) {
        jarvisMarchWalkthrough().then(function() { 
            highlightLine([-1]);
            document.getElementById("runButton").disabled = false;
        });
    }
}
