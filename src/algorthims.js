const math = require('mathjs');

function orient(p1, p2, p3) {
    // Returns 0 if p1, p2, and p3 are colinear
    // Returns 1 if p1, p2, and p3 are clockwise
    // Returns 2 if p1, p2, and p3 are counterclockwise
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

function bruteForce(points) {
    // Computes the convex hull of a list of points using a brute force approach
    // Returns a list of points on the convex hull

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

    // Remove duplicates
    finalHull = [];
    for (let p = 0; p < hull.length; p++) {
        let duplicate = false;
        for (let q = 0; q < finalHull.length; q++) {
            if (hull[p][0] == finalHull[q][0] && hull[p][1] == finalHull[q][1]) {
                duplicate = true;
                break;
            }
        }
        if (!duplicate) {
            finalHull.push(hull[p]);
        }
    }

    return finalHull;
}

function grahamScan(points) {
    // Computes the convex hull of a list of points using the Graham Scan approach
    // Returns a list of points on the convex hull

    // Sort points by increasing x-coordinate
    points.sort(function (a, b) {
        if (a[0] == b[0]) {
            return a[1] - b[1];
        }
        return a[0] - b[0];
    });

    // Create hull, pushing p1 and p2 onto hull
    if (points.length >= 2) {
        hull = [points[0], points[1]];
    } else {
        return [];
    }

    // Loop through the remaining points to create upper hull
    for (let i = 2; i < points.length; i++) {
        hull.push(points[i]);
        while (hull.length >= 3 && rLeftOfLine(hull[hull.length - 3], hull[hull.length - 2], hull[hull.length - 1])) {
            // Remove middle point from hull
            hull.splice(hull.length - 2, 1);
        }
    }

    // Prepare to create lower hull (reverse points and record starting length)
    points.reverse();
    let startingLength = hull.length;

    // Loop through the remaining points to create lower hull
    for (let i = 1; i < points.length; i++) {
        hull.push(points[i]);
        while (hull.length > startingLength && rLeftOfLine(hull[hull.length - 3], hull[hull.length - 2], hull[hull.length - 1])) {
            // Remove middle point from hull
            hull.splice(hull.length - 2, 1);
        }

        // Confirm that the last point is not the first point
        if (hull.length > startingLength && hull[hull.length - 1][0] == hull[0][0] && hull[hull.length - 1][1] == hull[0][1]) {
            // Remove last point from hull
            hull.splice(hull.length - 1, 1);
            break;
        }
    }

    // Reverse the hull so it is in counter-clockwise order
    hull.reverse();

    return hull;
}

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
            console.error("Expected: " + expectedHull[i][0] + ", " + expectedHull[i][1]);
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

        algorithms = [["Brute Force", bruteForce], ["Graham Scan", grahamScan]];

        for (let j = 0; j < algorithms.length; j++) {
            if (validateAlgorithm(algorithms[j][1], points, hull)) {
                console.log(algorithms[j][0] + " Test " + (i + 1) + " passed");
            } else {
                console.log(algorithms[j][0] + " Test " + (i + 1) + " failed");
            }
        }
    }
}

test();