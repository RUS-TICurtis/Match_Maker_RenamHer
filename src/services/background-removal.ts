import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

export interface BackgroundRemovalResult {
  uri: string;
  isTransparentCutout: boolean;
  width: number;
  height: number;
  error?: string;
}

const CUTOUTS_DIR = `${FileSystem.documentDirectory}wardrobe_cutouts/`;

/**
 * Ensures the local wardrobe cutouts directory exists.
 */
export async function ensureCutoutsDirectory(): Promise<string> {
  const dirInfo = await FileSystem.getInfoAsync(CUTOUTS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CUTOUTS_DIR, { intermediates: true });
  }
  return CUTOUTS_DIR;
}

/**
 * Pre-processes and downsamples an image to avoid mobile memory spikes.
 */
export async function preProcessImage(
  imageUri: string,
  maxWidth = 1080
): Promise<ImageManipulator.ImageResult> {
  return await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: maxWidth } }],
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.PNG,
    }
  );
}

/**
 * Deterministic background removal using pure alpha-mask cutout API (Remove.bg / PhotoRoom).
 * Does NOT use generative models, preserving 100% of the clothing's original pixels.
 */
export async function removeBackgroundWithCutoutApi(
  localUri: string,
  apiKey?: string
): Promise<BackgroundRemovalResult> {
  try {
    await ensureCutoutsDirectory();

    // Step 1: Downsample image to avoid uploading massive 48MP phone photos
    const downsampled = await preProcessImage(localUri, 1080);
    const destinationPath = `${CUTOUTS_DIR}cutout_${Date.now()}.png`;

    // Step 2: If API key provided, call deterministic cutout API
    if (apiKey) {
      const uploadResult = await FileSystem.uploadAsync(
        'https://api.remove.bg/v1.0/removebg',
        downsampled.uri,
        {
          headers: {
            'X-Api-Key': apiKey,
          },
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'image_file',
          parameters: {
            size: 'auto',
            format: 'png',
          },
        }
      );

      if (uploadResult.status === 200 && uploadResult.body) {
        // Save the resulting binary PNG
        await FileSystem.writeAsStringAsync(destinationPath, uploadResult.body, {
          encoding: FileSystem.EncodingType.Base64,
        });

        return {
          uri: destinationPath,
          isTransparentCutout: true,
          width: downsampled.width,
          height: downsampled.height,
        };
      }
    }

    // Step 3: Offline fallback — save the downscaled PNG locally
    await FileSystem.copyAsync({
      from: downsampled.uri,
      to: destinationPath,
    });

    return {
      uri: destinationPath,
      isTransparentCutout: false,
      width: downsampled.width,
      height: downsampled.height,
    };
  } catch (error) {
    return {
      uri: localUri,
      isTransparentCutout: false,
      width: 0,
      height: 0,
      error: error instanceof Error ? error.message : 'Unknown background removal error',
    };
  }
}
