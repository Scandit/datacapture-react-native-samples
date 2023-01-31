import React, { Component } from 'react';
import { Alert, AppState, BackHandler } from 'react-native';
import {
  Camera,
  DataCaptureContext,
  DataCaptureView,
  FrameSourceState,
} from 'scandit-react-native-datacapture-core';
import { IdCapture, IdCaptureOverlay, IdCaptureSettings, IdDocumentType, IdLayoutStyle } from 'scandit-react-native-datacapture-id';

import { requestCameraPermissionsIfNeeded } from './camera-permission-handler';

export class App extends Component {

  constructor() {
    super();

    // Create data capture context using your license key.
    this.dataCaptureContext = DataCaptureContext.forLicenseKey('-- ENTER YOUR SCANDIT LICENSE KEY HERE --');
    this.viewRef = React.createRef();
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.setupCapture();
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.dataCaptureContext.dispose();
  }

  handleAppStateChange = async (nextAppState) => {
    if (nextAppState.match(/inactive|background/)) {
      this.stopCapture();
    } else {
      this.startCapture();
    }
  }

  startCapture() {
    this.startCamera();
    this.idCapture.isEnabled = true;
  }

  stopCapture() {
    this.idCapture.isEnabled = false;
    this.stopCamera();
  }

  stopCamera() {
    if (this.camera) {
      this.camera.switchToDesiredState(FrameSourceState.Off);
    }
  }

  startCamera() {
    if (!this.camera) {
      // Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
      // default and must be turned on to start streaming frames to the data capture context for recognition.
      this.camera = Camera.default;
      this.dataCaptureContext.setFrameSource(this.camera);
    }

    // Switch camera on to start streaming frames and enable the id capture mode.
    // The camera is started asynchronously and will take some time to completely turn on.
    requestCameraPermissionsIfNeeded()
      .then(() => this.camera.switchToDesiredState(FrameSourceState.On))
      .catch(() => BackHandler.exitApp());
  }

  setupCapture() {
    // The Id capturing process is configured through id capture settings
    // and are then applied to the id capture instance that manages id recognition.
    const settings = new IdCaptureSettings();

    // We are interested in the front side of national Id Cards and passports using MRZ.
    settings.supportedDocuments = [
      IdDocumentType.IdCardVIZ,
      IdDocumentType.AAMVABarcode,
      IdDocumentType.DLVIZ,
      IdDocumentType.ArgentinaIdBarcode,
      IdDocumentType.ColombiaIdBarcode,
      IdDocumentType.SouthAfricaDlBarcode,
      IdDocumentType.SouthAfricaIdBarcode,
      IdDocumentType.ChinaExitEntryPermitMRZ,
      IdDocumentType.ChinaMainlandTravelPermitMRZ,
    ];

    // Create new Id capture mode with the settings from above.
    this.idCapture = IdCapture.forContext(this.dataCaptureContext, settings);

    // Register a listener to get informed whenever a new id got recognized.
    this.idCaptureListener = {
      didCaptureId: (_, session) => {
        if (session.newlyCapturedId == null) {
          return
        }

        // The `alert` call blocks execution until it's dismissed by the user. As no further frames would be processed
        // until the alert dialog is dismissed, we're showing the alert through a timeout and disabling the Id
        // capture mode until the dialog is dismissed, as you should not block the IdCaptureListener callbacks for
        // longer periods of time. See the documentation to learn more about this.
        this.idCapture.isEnabled = false;

        let result;
        if (session.newlyCapturedId.mrzResult != null) {
          result = this.descriptionForMrzResult(session.newlyCapturedId);
        } else if (session.newlyCapturedId.vizResult != null) {
          result = this.descriptionForVizResult(session.newlyCapturedId);
        } else if (session.newlyCapturedId.aamvaBarcodeResult != null) {
          result = this.descriptionForUsDriverLicenseBarcodeResult(session.newlyCapturedId);
        } else if (session.newlyCapturedId.usUniformedServicesBarcodeResult != null) {
          result = this.descriptionForUsUniformedServicesBarcodeResult(session.newlyCapturedId);
        } else {
          result = this.descriptionForCapturedId(session.newlyCapturedId);
        }

        Alert.alert(
          'Result',
          result,
          [{ text: 'OK', onPress: () => this.idCapture.isEnabled = true }],
          { cancelable: false }
        );
      },
      didFailWithError: (_, error, session) => {
        Alert.alert(
          'Error',
          error.message,
          { cancelable: false }
        );
      }
    };

    this.idCapture.addListener(this.idCaptureListener);

    // Add a Id capture overlay to the data capture view to render the location of captured ids on top of
    // the video preview. This is optional, but recommended for better visual feedback.
    this.overlay = IdCaptureOverlay.withIdCaptureForView(this.idCapture, this.viewRef.current);

    this.overlay.idLayoutStyle = IdLayoutStyle.Square;
  }

  descriptionForMrzResult(result) {
    return `${this.descriptionForCapturedId(result)}
    Document Code: ${result.mrzResult.documentCode}
    Names Are Truncated: ${result.mrzResult.namesAreTruncated ? "Yes" : "No"}
    Optional: ${result.mrzResult.optional || "empty"}
    Optional 1: ${result.mrzResult.optional1 || "empty"}`
  }

  descriptionForVizResult(result) {
    return `${this.descriptionForCapturedId(result)}
    Additional Name Information: ${result.vizResult.additionalNameInformation || "empty"}
    Additional Address Information: ${result.vizResult.additionalAddressInformation || "empty"}
    Place of Birth: ${result.vizResult.placeOfBirth || "empty"}
    Race: ${result.vizResult.race || "empty"}
    Religion: ${result.vizResult.religion || "empty"}
    Profession: ${result.vizResult.profession || "empty"}
    Marital Status: ${result.vizResult.maritalStatus || "empty"}
    Residential Status: ${result.vizResult.residentialStatus || "empty"}
    Employer: ${result.vizResult.employer || "empty"}
    Personal Id Number: ${result.vizResult.personalIdNumber || "empty"}
    Document Additional Number: ${result.vizResult.documentAdditionalNumber || "empty"}
    Issuing Jurisdiction: ${result.vizResult.issuingJurisdiction || "empty"}
    Issuing Authority: ${result.vizResult.issuingAuthority || "empty"}`
  }

  descriptionForUsDriverLicenseBarcodeResult(result) {
    return `${this.descriptionForCapturedId(result)}
    AAMVA Version: ${result.aamvaBarcodeResult.aamvaVersion}
    Jurisdiction Version: ${result.aamvaBarcodeResult.jurisdictionVersion}
    IIN: ${result.aamvaBarcodeResult.iIN}
    Issuing Jurisdiction: ${result.aamvaBarcodeResult.issuingJurisdiction}
    Issuing Jurisdiction ISO: ${result.aamvaBarcodeResult.issuingJurisdictionISO}
    Eye Color: ${result.aamvaBarcodeResult.eyeColor || "empty"}
    Hair Color: ${result.aamvaBarcodeResult.hairColor || "empty"}
    Height Inch: ${result.aamvaBarcodeResult.heightInch || 0}
    Height Cm: ${result.aamvaBarcodeResult.heightCm || 0}
    Weight Lb: ${result.aamvaBarcodeResult.weightLbs || 0}
    Weight Kg: ${result.aamvaBarcodeResult.weightKg || 0}
    Place of Birth: ${result.aamvaBarcodeResult.placeOfBirth || "empty"}
    Race: ${result.aamvaBarcodeResult.race || "empty"}
    Document Discriminator Number: ${result.aamvaBarcodeResult.documentDiscriminatorNumber || "empty"}
    Vehicle Class: ${result.aamvaBarcodeResult.vehicleClass || "empty"}
    Restrictions Code: ${result.aamvaBarcodeResult.restrictionsCode || "empty"}
    Endorsements Code: ${result.aamvaBarcodeResult.endorsementsCode || "empty"}
    Card Revision Date: ${JSON.stringify(result.aamvaBarcodeResult.cardRevisionDate.date) || "empty"}
    Middle Name: ${result.aamvaBarcodeResult.middleName || "empty"}
    Driver Name Suffix: ${result.aamvaBarcodeResult.driverNameSuffix || "empty"}
    Driver Name Prefix: ${result.aamvaBarcodeResult.driverNamePrefix || "empty"}
    Last Name Truncation: ${result.aamvaBarcodeResult.lastNameTruncation || "empty"}
    First Name Truncation: ${result.aamvaBarcodeResult.firstNameTruncation || "empty"}
    Middle Name Truncation: ${result.aamvaBarcodeResult.middleNameTruncation || "empty"}
    Alias Family Name: ${result.aamvaBarcodeResult.aliasFamilyName || "empty"}
    Alias Given Name: ${result.aamvaBarcodeResult.aliasGivenName || "empty"}
    Alias Suffix Name: ${result.aamvaBarcodeResult.aliasSuffixName || "empty"}`
  }

  descriptionForUsUniformedServicesBarcodeResult(result) {
    return `${this.descriptionForCapturedId(result)}
    Version: ${result.usUniformedServicesBarcodeResult.version}
    Sponsor Flag: ${result.usUniformedServicesBarcodeResult.sponsorFlag}
    Person Designator Document: ${result.usUniformedServicesBarcodeResult.personDesignatorDocument}
    Family Sequence Number: ${result.usUniformedServicesBarcodeResult.familySequenceNumber}
    Deers Dependent Suffix Code: ${result.usUniformedServicesBarcodeResult.deersDependentSuffixCode}
    Deers Dependent Suffix Description: ${result.usUniformedServicesBarcodeResult.deersDependentSuffixDescription}
    Height: ${result.usUniformedServicesBarcodeResult.height}
    Weight: ${result.usUniformedServicesBarcodeResult.weight}
    Hair Color: ${result.usUniformedServicesBarcodeResult.hairColor}
    Eye Color: ${result.usUniformedServicesBarcodeResult.eyeColor}
    Direct Care Flag Code: ${result.usUniformedServicesBarcodeResult.directCareFlagCode}
    Direct Care Flag Description: ${result.usUniformedServicesBarcodeResult.directCareFlagDescription}
    Civilian Health Care Flag Code: ${result.usUniformedServicesBarcodeResult.civilianHealthCareFlagCode}
    Civilian Health Care Flag Description: ${result.usUniformedServicesBarcodeResult.civilianHealthCareFlagDescription}
    Commissary Flag Code: ${result.usUniformedServicesBarcodeResult.commissaryFlagCode}
    Commissary Flag Description: ${result.usUniformedServicesBarcodeResult.commissaryFlagDescription}
    MWR Flag Code: ${result.usUniformedServicesBarcodeResult.mwrFlagCode}
    MWR Flag Description: ${result.usUniformedServicesBarcodeResult.mwrFlagDescription}
    Exchange Flag Code: ${result.usUniformedServicesBarcodeResult.exchangeFlagCode}
    Exchange Flag Description: ${result.usUniformedServicesBarcodeResult.exchangeFlagDescription}
    Champus Effective Date: ${JSON.stringify(result.usUniformedServicesBarcodeResult.champusEffectiveDate.date) || "empty"}
    Champus Expiry Date: ${JSON.stringify(result.usUniformedServicesBarcodeResult.champusExpiryDate.date) || "empty"}
    Form Number: ${result.usUniformedServicesBarcodeResult.formNumber}
    Security Code: ${result.usUniformedServicesBarcodeResult.securityCode}
    Service Code: ${result.usUniformedServicesBarcodeResult.serviceCode}
    Status Code: ${result.usUniformedServicesBarcodeResult.statusCode}
    Status Code Description: ${result.usUniformedServicesBarcodeResult.statusCodeDescription}
    Branch Of Service: ${result.usUniformedServicesBarcodeResult.branchOfService}
    Rank: ${result.usUniformedServicesBarcodeResult.rank}
    Pay Grade: ${result.usUniformedServicesBarcodeResult.payGrade}
    Sponsor Name: ${result.usUniformedServicesBarcodeResult.sponsorName || "empty"}
    Sponsor Person Designator Identifier: ${result.usUniformedServicesBarcodeResult.sponsorPersonDesignatorIdentifier || 0}
    Relationship Code: ${result.usUniformedServicesBarcodeResult.relationshipCode || "empty"}
    Relationship Description: ${result.usUniformedServicesBarcodeResult.relationshipDescription || "empty"}
    Geneva Convention Category: ${result.usUniformedServicesBarcodeResult.genevaConventionCategory || "empty"}
    Blood Type: ${result.usUniformedServicesBarcodeResult.bloodType || "empty"}`
  }

  descriptionForCapturedId(result) {
    return `Name: ${result.firstName || "empty"}
    Last Name: ${result.lastName || "empty"}
    Full Name: ${result.fullName}
    Sex: ${result.sex || "empty"}
    Date of Birth: ${JSON.stringify(result.dateOfBirth && result.dateOfBirth.date) || "empty"}
    Nationality: ${result.nationality || "empty"}
    Address: ${result.address || "empty"}
    Document Type: ${result.documentType}
    Captured Result Type: ${result.capturedResultType}
    Issuing Country: ${result.issuingCountry || "empty"}
    Issuing Country ISO: ${result.issuingCountryISO || "empty"}
    Document Number: ${result.documentNumber || "empty"}
    Date of Expiry: ${JSON.stringify(result.dateOfExpiry && result.dateOfExpiry.date) || "empty"}
    Date of Issue: ${JSON.stringify(result.dateOfIssue && result.dateOfIssue.date) || "empty"}`
  }

  render() {
    return (
      <DataCaptureView style={{ flex: 1 }} context={this.dataCaptureContext} ref={this.viewRef} />
    );
  };
}
