# Building the Number Bakery Android APK from GitHub

This project includes a ready-to-run **Capacitor + GitHub Actions** pipeline that automatically builds an installable Android `.apk` whenever you push to GitHub or trigger a manual build.

## 1. Push to GitHub
1. Create a new repository on GitHub and push this project to the `main` branch.
2. Open the **Actions** tab in your GitHub repository.
3. The **Build Android APK** workflow will start automatically (or click **Run workflow** to choose `debug` or `release`).

## 2. Download Your APK
1. Click the completed **Build Android APK** workflow run.
2. Scroll to the **Artifacts** section at the bottom.
3. Click **`number-bakery-android-apk`** to download the zip containing **`NumberBakery-debug.apk`**.
4. Transfer the `.apk` to your Android phone or tablet and install it (enable *Install unknown apps* if prompted).

## 3. Optional: Signed Release APK (Google Play / Production)
To build a signed release APK via GitHub Actions, add these 4 repository secrets under **Settings → Secrets and variables → Actions**:
- `ANDROID_KEYSTORE_BASE64`: Your `.jks` keystore encoded in base64 (`base64 -w 0 my-release-key.jks`)
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_ALIAS`: Key alias
- `ANDROID_KEY_PASSWORD`: Key password

Then either run the workflow manually with **`release`** selected, or push a version tag like `git tag v1.0.0 && git push origin v1.0.0` to automatically publish the signed APK to **GitHub Releases**.
