package com.scandit.matrixscanbubblessample;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import javax.annotation.Nonnull;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  @Nonnull
  protected String getMainComponentName() {
    return "MatrixScanBubblesSample";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
      return new DefaultReactActivityDelegate(this, getMainComponentName(), DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }
}
