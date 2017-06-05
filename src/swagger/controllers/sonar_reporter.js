/*
 Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
 "use strict";

var path = require('path');
var util = require('util');
var Report = require('istanbul').Report;
var utils = require('istanbul').utils;
var TreeSummarizer = require('istanbul').TreeSummarizer;

/**
 * a `Report` implementation that produces a cobertura-style XML file that conforms to the
 * http://cobertura.sourceforge.net/xml/coverage-04.dtd DTD.
 *
 * Usage
 * -----
 *
 *      var report = require('istanbul').Report.create('cobertura');
 *
 * @class SonarReport
 * @module report
 * @extends Report
 * @constructor
 * @param {Object} opts optional
 * @param {String} [opts.dir] the directory in which to the cobertura-coverage.xml will be written
 */
function SonarReport(opts) {
    Report.call(this);
    opts = opts || {};
    this.projectRoot = process.cwd();
    this.dir = opts.dir || this.projectRoot;
    this.file = opts.file || this.getDefaultConfig().file;
    this.opts = opts;
}

SonarReport.TYPE = 'sonarreport';
util.inherits(SonarReport, Report);



function quote(thing) {
    return '"' + thing + '"';
}

function attr(n, v) {
    return ' ' + n + '=' + quote(v) + ' ';
}

function branchCoverageByLine(fileCoverage) {
    var branchMap = fileCoverage.branchMap,
        branches = fileCoverage.b,
        ret = {};
    Object.keys(branchMap).forEach(function (k) {
        var line = branchMap[k].line,
            branchData = branches[k];
        ret[line] = ret[line] || [];
        ret[line].push.apply(ret[line], branchData);
    });
    Object.keys(ret).forEach(function (k) {
        var dataArray = ret[k],
            covered = dataArray.filter(function (item) { return item > 0; }),
            coverage = covered.length / dataArray.length * 100;
        ret[k] = { covered: covered.length, total: dataArray.length, coverage: coverage };
    });
    return ret;
}

function addFileStats(node, fileCoverage, writer, projectRoot) {
    writer.println('\t<file' +
      attr('path', path.relative(projectRoot, node.fullPath())) + 
      '>'
    );

    fileCoverage = utils.incrementIgnoredTotals(fileCoverage);
    var branchByLine = branchCoverageByLine(fileCoverage),
    lines = fileCoverage.l;

    Object.keys(lines).forEach(function (k) {
        var str = '\t\t<lineToCover' +
            attr('lineNumber', k) +
            attr('covered', lines[k] == 0 ? false:true),
            branchDetail = branchByLine[k];

        if (!branchDetail) {
            str += attr('branch', false);
        } else {
            str += attr('branch', true) +
                attr('branchesToCover', branchDetail.total) +
                attr('coveredBranches', branchDetail.covered);
        }
        writer.println(str + '/>');
    });
    writer.println('\t</file>');
}

function walk(node, collector, writer, level, projectRoot) {
    var metrics;
    if (level === 0) {
        metrics = node.metrics;
        writer.println('<coverage version="1">');
    }

    if (node.packageMetrics) {
        metrics = node.packageMetrics;
        node.children.filter(function (child) { return child.kind !== 'dir'; }).
            forEach(function (child) {
                addFileStats(child, collector.fileCoverageFor(child.fullPath()), writer, projectRoot);
            });
    }

    node.children.filter(function (child) { return child.kind === 'dir'; }).
      forEach(function (child) {
          walk(child, collector, writer, level + 1, projectRoot);
      });

    if (level === 0) {
        writer.println('</coverage>');
    }
}

Report.mix(SonarReport, {
    synopsis: function () {
        return 'XML coverage report that can be consumed by the cobertura tool';
    },
    getDefaultConfig: function () {
        return { file: 'sonar-coverage.xml' };
    },
    writeReport: function (collector, sync) {
        var FW = require('istanbul').FileWriter;
        var sync = true;
        var fileWriter = new FW(sync);



        var summarizer = new TreeSummarizer(),
            outputFile = path.join(this.dir, this.file),
            writer = this.opts.writer || fileWriter,
            projectRoot = this.projectRoot,
            that = this,
            tree,
            root;

        collector.files().forEach(function (key) {
            summarizer.addFileCoverageSummary(key, utils.summarizeFileCoverage(collector.fileCoverageFor(key)));
        });
        tree = summarizer.getTreeSummary();
        root = tree.root;
        writer.on('done', function () { that.emit('done'); });
        writer.writeFile(outputFile, function (contentWriter) {
            walk(root, collector, contentWriter, 0, projectRoot);
            writer.done();
        });
    }
});

module.exports = SonarReport;


