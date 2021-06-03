import {
    RectangularViewfinder,
    RectangularViewfinderAnimation,
    LaserlineViewfinder,
    SpotlightViewfinder,
    AimerViewfinder,
    Color,
    SizeWithUnit,
    NumberWithUnit,
    MeasureUnit,
} from 'scandit-react-native-datacapture-core';

export default class ViewfinderFactory {
    constructor(viewfinderType, settings) {
        switch (viewfinderType) {
            case 'rectangular':
                return this.rectangularVF(
                    settings['rectangularsettings.color'],
                    settings['rectangularsettings.size'],
                    settings['rectangularsettings.style'],
                );
            case 'laserline':
                return this.laserlineVF(
                    settings['laserlinesettings.color.enabled'],
                    settings['laserlinesettings.color.disabled'],
                    settings['laserlinesettings.size']
                );
            case 'spotlight':
                return this.spotlightVF(
                    settings['spotlightsettings.color.background'],
                    settings['spotlightsettings.color.enabled'],
                    settings['spotlightsettings.color.disabled'],
                    settings['spotlightsettings.size'],
                );
            case 'aimer':
                return this.aimerVF(
                    settings['aimersettings.color.frame'],
                    settings['aimersettings.color.dot'],
                );
            default:
                return null;
        }
    }

    clamp(value, min, max) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    rectangularVF(rectangularViewfinderColor, rectangularViewfinderSize, rectangularViewfinderStyle) {
        let rectangularViewfinder = new RectangularViewfinder();

        if (!!rectangularViewfinderStyle) {
            const { animation, dimming, isLooping, lineStyle, styleName } = rectangularViewfinderStyle;
            if (styleName && lineStyle) {
                rectangularViewfinder = new RectangularViewfinder(styleName, lineStyle);
            } else if (styleName) {
                rectangularViewfinder = new RectangularViewfinder(styleName);
            }

            if (dimming) {
                rectangularViewfinder.dimming = this.clamp(parseFloat(dimming.inputBoxValue), 0, 1);
            }

            if (animation) {
                rectangularViewfinder.animation = new RectangularViewfinderAnimation(!!isLooping);
            } else {
                rectangularViewfinder.animation = null;
            }
        }

        if (!!rectangularViewfinderColor) {
            rectangularViewfinder.color = Color.fromHex(rectangularViewfinderColor);
        }

        if (!!rectangularViewfinderSize) {
            const { width, height } = rectangularViewfinderSize;

            if (width && height) {
                rectangularViewfinder.setSize(new SizeWithUnit(
                    new NumberWithUnit(parseFloat(width.inputBoxValue), width.measurementUnitValue || MeasureUnit.DIP),
                    new NumberWithUnit(parseFloat(height.inputBoxValue), height.measurementUnitValue || MeasureUnit.DIP)
                ))
            } else if (width && rectangularViewfinderSize['Width to height aspect ratio']) {
                rectangularViewfinder.setHeightAndAspectRatio(
                    new NumberWithUnit(parseFloat(height.inputBoxValue), height.measurementUnitValue || MeasureUnit.DIP),
                    rectangularViewfinderSize['Width to height aspect ratio']
                )
            } else if (height && rectangularViewfinderSize['Height to width aspect ratio']) {
                rectangularViewfinder.setWidthAndAspectRatio(
                    new NumberWithUnit(parseFloat(width.inputBoxValue), height.measurementUnitValue || MeasureUnit.DIP),
                    rectangularViewfinderSize['Height to width aspect ratio']
                )
            }
        }

        return rectangularViewfinder;
    }

    laserlineVF(enabledColor, disabledColor, size) {
        const laserlineViewfinder = new LaserlineViewfinder();

        if (!!enabledColor) {
            laserlineViewfinder.enabledColor = Color.fromHex(enabledColor);
        }

        if (!!disabledColor) {
            laserlineViewfinder.disabledColor = Color.fromHex(disabledColor);
        }

        if (!!size) {
            laserlineViewfinder.width = new NumberWithUnit(parseFloat(size.Width), MeasureUnit.DIP);
        }

        return laserlineViewfinder;
    }

    spotlightVF(bgColor, enabledColor, disabledColor, size) {
        const spotlightViewfinder = new SpotlightViewfinder();

        if (!!bgColor) {
            spotlightViewfinder.backgroundColor = Color.fromHex(bgColor);
        }

        if (!!enabledColor) {
            spotlightViewfinder.enabledBorderColor = Color.fromHex(enabledColor);
        }

        if (!!disabledColor) {
            spotlightViewfinder.disabledBorderColor = Color.fromHex(disabledColor);
        }

        if (!!size) {
            const width = size['Width'];
            const height = size['Height'];

            if (width && height) {
                spotlightViewfinder.setSize(new SizeWithUnit(
                    new NumberWithUnit(parseFloat(width), MeasureUnit.DIP),
                    new NumberWithUnit(parseFloat(height), MeasureUnit.DIP)
                ))
            } else if (width && size['Width to height aspect ratio']) {
                spotlightViewfinder.setHeightAndAspectRatio(
                    new NumberWithUnit(parseFloat(height), MeasureUnit.DIP),
                    size['Width to height aspect ratio']
                )
            } else if (height && size['Height to width aspect ratio']) {
                spotlightViewfinder.setWidthAndAspectRatio(
                    new NumberWithUnit(parseFloat(width), MeasureUnit.DIP),
                    size['Height to width aspect ratio']
                )
            }
        }

        return spotlightViewfinder;
    }

    aimerVF(frameColor, dotColor) {
        const aimerViewfinder = new AimerViewfinder();

        if (!!frameColor) {
            aimerViewfinder.frameColor = Color.fromHex(frameColor);
        }

        if (!!dotColor) {
            aimerViewfinder.dotColor = Color.fromHex(dotColor);
        }

        return aimerViewfinder;
    }
}
