import {
    RectangularViewfinder,
    RectangularViewfinderAnimation,
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
