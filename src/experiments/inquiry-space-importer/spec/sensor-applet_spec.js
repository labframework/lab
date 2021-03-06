// Generated by CoffeeScript 1.3.3
(function() {

  describe("SensorApplet class", function() {
    var applet;
    applet = null;
    beforeEach(function() {
      return applet = new ISImporter.SensorApplet();
    });
    it("should exist", function() {
      return expect(applet).toBeDefined();
    });
    describe("testAppletReady method", function() {
      return it("should defer to child class implementation", function() {
        return expect(applet.testAppletReady).toThrow();
      });
    });
    describe("getHTML method", function() {
      return it("should defer to child class implementation", function() {
        return expect(applet.getHTML).toThrow();
      });
    });
    describe("_startSensor method", function() {
      return it("should defer to child class implementation", function() {
        return expect(applet._startSensor).toThrow();
      });
    });
    describe("_startSensor method", function() {
      return it("should defer to child class implementation", function() {
        return expect(applet._stopSensor).toThrow();
      });
    });
    describe("_appendHTML method", function() {
      return it("should exist and be callable", function() {
        return expect(typeof applet._appendHTML).toBe('function');
      });
    });
    describe("getState method", function() {
      return describe("initially", function() {
        return it("should return 'not appended'", function() {
          return expect(applet.getState()).toBe('not appended');
        });
      });
    });
    describe("append method", function() {
      beforeEach(function() {
        spyOn(applet, 'getHTML').andReturn('<applet> tag from getHTML method');
        spyOn(applet, '_appendHTML');
        return applet.testAppletReady = function() {};
      });
      it("should call the getHTML method to request the applet HTML", function() {
        applet.append();
        return expect(applet.getHTML).toHaveBeenCalled();
      });
      it("should append the applet HTML to the DOM", function() {
        applet.append();
        return expect(applet._appendHTML).toHaveBeenCalledWith('<applet> tag from getHTML method');
      });
      it("should go into 'appended' state", function() {
        applet.append();
        return expect(applet.getState()).toBe('appended');
      });
      describe("when the applet is in the 'not appended' state", function() {
        beforeEach(function() {
          return applet.getState = function() {
            return 'not appended';
          };
        });
        return it("should not throw an error", function() {
          return expect(function() {
            return applet.append();
          }).not.toThrow();
        });
      });
      return describe("when the applet is not in the 'not appended' state", function() {
        beforeEach(function() {
          return applet.getState = function() {
            return 'appended';
          };
        });
        return it("should throw an error", function() {
          return expect(function() {
            return applet.append();
          }).toThrow();
        });
      });
    });
    describe("after appending", function() {
      beforeEach(function() {
        applet.getHTML = function() {
          return 'dummy <applet>';
        };
        applet._appendHTML = function() {};
        applet.testAppletReady = function() {};
        applet.testAppletReadyInterval = 50;
        spyOn(applet, 'testAppletReady');
        return runs(function() {
          return applet.append();
        });
      });
      describe("immediately", function() {
        return it("should not have called testAppletReady", function() {
          return runs(function() {
            return expect(applet.testAppletReady).not.toHaveBeenCalled();
          });
        });
      });
      return describe("and the applet is not yet ready", function() {
        beforeEach(function() {
          return runs(function() {
            return applet.testAppletReady.andReturn(false);
          });
        });
        return describe("after waiting", function() {
          beforeEach(function() {
            return waits(100);
          });
          it("should call testAppletReady additional times", function() {
            runs(function() {
              return applet.testAppletReady.reset();
            });
            waits(100);
            return runs(function() {
              return expect(applet.testAppletReady).toHaveBeenCalled();
            });
          });
          return describe("and the applet becomes ready", function() {
            var appletReadyCallback;
            appletReadyCallback = null;
            beforeEach(function() {
              return runs(function() {
                appletReadyCallback = jasmine.createSpy('appletReadyCallback');
                applet.on('appletReady', appletReadyCallback);
                return applet.testAppletReady.andReturn(true);
              });
            });
            describe("initially", function() {
              it("should be in the 'appended' state", function() {
                return runs(function() {
                  return expect(applet.getState()).toBe('appended');
                });
              });
              return it("should not have fired the appletReady event", function() {
                return runs(function() {
                  return expect(appletReadyCallback).not.toHaveBeenCalled();
                });
              });
            });
            describe("and the sensorIsReady method is not called", function() {
              return describe("after waiting", function() {
                beforeEach(function() {
                  return waits(100);
                });
                it("should have stopped calling testAppletReady", function() {
                  runs(function() {
                    return applet.testAppletReady.reset();
                  });
                  waits(100);
                  return runs(function() {
                    return expect(applet.testAppletReady).not.toHaveBeenCalled();
                  });
                });
                it("should be in the 'applet ready' state", function() {
                  return runs(function() {
                    return expect(applet.getState()).toBe('applet ready');
                  });
                });
                return it("should have fired the appletReady event", function() {
                  return runs(function() {
                    return expect(appletReadyCallback).toHaveBeenCalled();
                  });
                });
              });
            });
            return describe("and the sensorIsReady method is called", function() {
              beforeEach(function() {
                return runs(function() {
                  return applet.sensorIsReady();
                });
              });
              return describe("after waiting", function() {
                beforeEach(function() {
                  return waits(100);
                });
                it("should be in the 'stopped' state", function() {
                  return runs(function() {
                    return expect(applet.getState()).toBe('stopped');
                  });
                });
                return it("should still have fired the appletReady event", function() {
                  return runs(function() {
                    return expect(appletReadyCallback).toHaveBeenCalled();
                  });
                });
              });
            });
          });
        });
      });
    });
    describe("the sensorIsReady method", function() {
      beforeEach(function() {
        return applet._state = 'applet ready';
      });
      it("should go to the 'stopped' state", function() {
        expect(applet.getState()).toBe('applet ready');
        applet.sensorIsReady();
        return expect(applet.getState()).toBe('stopped');
      });
      it("should fire the 'sensorReady' event", function() {
        var sensorReady;
        sensorReady = jasmine.createSpy('sensorReady');
        applet.on('sensorReady', sensorReady);
        applet.sensorIsReady();
        return expect(sensorReady).toHaveBeenCalled();
      });
      describe("the 'start' method", function() {
        beforeEach(function() {
          return spyOn(applet, '_startSensor');
        });
        describe("in the 'stopped' state", function() {
          beforeEach(function() {
            applet._state = 'stopped';
            return applet.start();
          });
          it("should call the _startSensor method", function() {
            return expect(applet._startSensor).toHaveBeenCalled();
          });
          return it("should call go to the 'started' state", function() {
            return expect(applet.getState()).toBe('started');
          });
        });
        return describe("not in the 'stopped' state", function() {
          beforeEach(function() {
            applet._state = 'not stopped';
            return applet.start();
          });
          it("should not call the _startSensor method", function() {
            return expect(applet._startSensor).not.toHaveBeenCalled();
          });
          return it("should not change state", function() {
            return expect(applet.getState()).toBe('not stopped');
          });
        });
      });
      return describe("the 'stop' method", function() {
        beforeEach(function() {
          return spyOn(applet, '_stopSensor');
        });
        describe("when in the 'started' state", function() {
          beforeEach(function() {
            applet._state = 'started';
            return applet.stop();
          });
          it("should call the _stopSensor method", function() {
            return expect(applet._stopSensor).toHaveBeenCalled();
          });
          return it("should go the the 'stopped' state", function() {
            return expect(applet.getState()).toBe('stopped');
          });
        });
        return describe("when not in the 'started' state", function() {
          beforeEach(function() {
            applet._state = 'not started';
            return applet.stop();
          });
          it("should not call the _stopSensor method", function() {
            return expect(applet._stopSensor).not.toHaveBeenCalled();
          });
          return it("should not change state", function() {
            return expect(applet.getState()).toBe('not started');
          });
        });
      });
    });
    describe("remove method", function() {
      beforeEach(function() {
        applet._removeApplet = function() {};
        return spyOn(applet, '_removeApplet');
      });
      describe("when not in an applet callback", function() {
        describe("and the applet is in the 'not appended' state", function() {
          beforeEach(function() {
            expect(applet.getState()).toBe('not appended');
            return applet.remove();
          });
          return it("should not call the _removeApplet method", function() {
            return expect(applet._removeApplet).not.toHaveBeenCalled();
          });
        });
        return describe("and the applet is not in the 'not appended' state", function() {
          beforeEach(function() {
            applet._state = 'appended';
            expect(applet.getState()).toBe('appended');
            return applet.remove();
          });
          it("should call the _removeApplet method", function() {
            return expect(applet._removeApplet).toHaveBeenCalled();
          });
          return it("should transition to the 'not appended' state", function() {
            return expect(applet.getState()).toBe('not appended');
          });
        });
      });
      return describe("when in an applet callback", function() {
        beforeEach(function() {
          return applet.startAppletCallback();
        });
        describe("and the applet is in the 'not appended' state", function() {
          beforeEach(function() {
            return runs(function() {
              expect(applet.getState()).toBe('not appended');
              return applet.remove();
            });
          });
          return describe("after waiting", function() {
            beforeEach(function() {
              return waits(100);
            });
            return it("should not have called the _removeApplet method", function() {
              return runs(function() {
                return expect(applet._removeApplet).not.toHaveBeenCalled();
              });
            });
          });
        });
        return describe("and the applet is NOT in the 'not appended' state", function() {
          beforeEach(function() {
            return runs(function() {
              applet._state = 'stopped';
              expect(applet.getState()).toBe('stopped');
              return applet.remove();
            });
          });
          describe("immediately", function() {
            it("should not change state", function() {
              return runs(function() {
                return expect(applet.getState()).toBe('stopped');
              });
            });
            return it("should not call the _removeApplet method", function() {
              return runs(function() {
                return expect(applet._removeApplet).not.toHaveBeenCalled();
              });
            });
          });
          return describe("after waiting", function() {
            beforeEach(function() {
              return waits(100);
            });
            it("should have called the _removeApplet method", function() {
              return expect(applet._removeApplet).toHaveBeenCalled();
            });
            return it("should transition to the 'not appended' state", function() {
              return expect(applet.getState()).toBe('not appended');
            });
          });
        });
      });
    });
    return describe("initially", function() {
      describe("getIsInAppletCallback method", function() {
        return it("should return false", function() {
          return expect(applet.getIsInAppletCallback()).toBe(false);
        });
      });
      describe("endAppletCallback method", function() {
        return it("should throw an error", function() {
          return expect(applet.endAppletCallback).toThrow();
        });
      });
      return describe("after startAppletCallback method is called", function() {
        beforeEach(function() {
          return applet.startAppletCallback();
        });
        describe("getIsInAppletCallback method", function() {
          return it("should return true", function() {
            return expect(applet.getIsInAppletCallback()).toBe(true);
          });
        });
        describe("startAppletCallback method", function() {
          return it("should throw an error", function() {
            return expect(applet.startAppletCallback).toThrow();
          });
        });
        return describe("after endAppletCallback method is called", function() {
          beforeEach(function() {
            return applet.endAppletCallback();
          });
          describe("getIsInAppletCallback method", function() {
            return it("should return false", function() {
              return expect(applet.getIsInAppletCallback()).toBe(false);
            });
          });
          return describe("endAppletCallback method", function() {
            return it("should throw an error", function() {
              return expect(applet.endAppletCallback).toThrow();
            });
          });
        });
      });
    });
  });

}).call(this);
