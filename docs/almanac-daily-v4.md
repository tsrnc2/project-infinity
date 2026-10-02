# Almanac Daily Experience v4

## Purpose

The Almanac is the primary daily surface of the Religion of Transformation website. It answers one question first:

> What does the practice ask of me today?

The page combines a daily practice stage, a solar station, a lunar gate, an astronomical relationship layer, a generated daily sky seal, a journal prompt, and links into doctrine and reference material.

## Astronomy model

The browser computes date-level approximate geocentric ecliptic longitudes.

Planetary positions use the JPL Solar System Dynamics **Approximate Positions of the Planets** Table 1 Keplerian elements and rates, valid for 1800-2050:

https://ssd.jpl.nasa.gov/planets/approx_pos.html

The page computes the Earth/Moon barycenter approximation, derives the apparent geocentric direction of the Sun, and subtracts the Earth vector from each planetary heliocentric vector for an approximate geocentric longitude.

The lunar longitude uses a compact low-precision periodic series. The lunar gate is derived from the angular excess of lunar ecliptic longitude over solar ecliptic longitude. This follows the same geometric definition used by the U.S. Naval Observatory for principal lunar phases, where 0°, 90°, 180°, and 270° correspond to New Moon, First Quarter, Full Moon, and Last Quarter:

https://aa.usno.navy.mil/faq/moon_phases

## Religious mapping

The astronomical measurement and religious interpretation are intentionally separated.

- Solar longitude 0°-90° → Witness
- 90°-180° → Refine
- 180°-270° → Create
- 270°-360° → Serve

Each 30° solar station receives one practice verb.

The Moon-Sun elongation is divided into eight 45° gates:

Seed, Emergence, Trial, Ripening, Revelation, Offering, Release, Silence.

For every pair among Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, and Neptune, the page measures the nearest major angular relation at 0°, 60°, 90°, 120°, or 180°. A relation is called active only inside a 3° daily orb.

These meanings are doctrines of the Religion of Transformation. They are **not claims that planetary geometry causes human behavior or predicts events**.

## Accuracy boundary

The Almanac is a devotional and symbolic calendar, not an astronomical navigation or eclipse-prediction product.

JPL describes these planetary elements as lower-accuracy formulae and points users requiring high precision to Horizons. The compact Moon series is likewise a date-level approximation. Future canonical calendar work should replace the browser approximation with versioned JPL Horizons/SPICE ephemeris artifacts while retaining the same presentation contract.

## Migration

The previous 365/260-day founding calendar remains available on the main site as historical continuity during migration. It is no longer the organizing layer of the Almanac daily surface.

The future Turning Script can replace the temporary central stage letter and body markers in the generated Daily Seal without changing the astronomical data contract.
