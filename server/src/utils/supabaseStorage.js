import { createClient } from '@supabase/supabase-js';

// Initialiser le client Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase Storage non configuré. Les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Upload un fichier vers Supabase Storage
 * @param {Buffer} fileBuffer - Le buffer du fichier
 * @param {string} fileName - Le nom du fichier
 * @param {string} bucket - Le bucket Supabase (par défaut: 'bulletins')
 * @returns {Promise<{path: string, url: string}>}
 */
export const uploadFileToSupabase = async (fileBuffer, fileName, bucket = 'bulletins') => {
  if (!supabase) {
    throw new Error('Supabase Storage n\'est pas configuré. Veuillez définir SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env');
  }

  try {
    // Créer le bucket s'il n'existe pas (avec gestion d'erreur si déjà existant)
    const { error: bucketError } = await supabase.storage.createBucket(bucket, {
      public: false, // Les fichiers ne sont pas publics par défaut
      fileSizeLimit: 10485760, // 10MB
    });

    // Ignorer l'erreur si le bucket existe déjà
    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.warn('Erreur lors de la création du bucket:', bucketError.message);
    }

    // Générer un nom de fichier unique avec timestamp
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    const filePath = `imports/${uniqueFileName}`;

    // Upload le fichier
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: false, // Ne pas écraser les fichiers existants
      });

    if (error) {
      throw new Error(`Erreur lors de l'upload vers Supabase: ${error.message}`);
    }

    // Obtenir l'URL signée pour télécharger le fichier (valide 1 heure)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // URL valide 1 heure

    if (urlError) {
      console.warn('Impossible de créer une URL signée:', urlError.message);
    }

    return {
      path: filePath,
      url: urlData?.signedUrl || null,
      publicUrl: supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl,
    };
  } catch (err) {
    console.error('Erreur Supabase Storage:', err);
    throw err;
  }
};

/**
 * Télécharge un fichier depuis Supabase Storage
 * @param {string} filePath - Le chemin du fichier dans le bucket
 * @param {string} bucket - Le bucket Supabase (par défaut: 'bulletins')
 * @returns {Promise<Buffer>}
 */
export const downloadFileFromSupabase = async (filePath, bucket = 'bulletins') => {
  if (!supabase) {
    throw new Error('Supabase Storage n\'est pas configuré');
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      throw new Error(`Erreur lors du téléchargement depuis Supabase: ${error.message}`);
    }

    // Convertir le Blob en Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('Erreur lors du téléchargement:', err);
    throw err;
  }
};

/**
 * Supprime un fichier de Supabase Storage
 * @param {string} filePath - Le chemin du fichier dans le bucket
 * @param {string} bucket - Le bucket Supabase (par défaut: 'bulletins')
 * @returns {Promise<void>}
 */
export const deleteFileFromSupabase = async (filePath, bucket = 'bulletins') => {
  if (!supabase) {
    throw new Error('Supabase Storage n\'est pas configuré');
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  } catch (err) {
    console.error('Erreur lors de la suppression:', err);
    throw err;
  }
};

/**
 * Liste les fichiers dans un dossier du bucket
 * @param {string} folder - Le dossier à lister (par défaut: 'imports')
 * @param {string} bucket - Le bucket Supabase (par défaut: 'bulletins')
 * @returns {Promise<Array>}
 */
export const listFilesInSupabase = async (folder = 'imports', bucket = 'bulletins') => {
  if (!supabase) {
    throw new Error('Supabase Storage n\'est pas configuré');
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      throw new Error(`Erreur lors de la liste: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('Erreur lors de la liste:', err);
    throw err;
  }
};

export default supabase;



