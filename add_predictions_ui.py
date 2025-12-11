"""Script pour ajouter l'UI de l'étape Prédictions"""

# Lire le fichier
with open('app/dashboard/upload/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1. Ajouter les imports nécessaires (après les imports existants, avant export default)
import_line_idx = None
for i, line in enumerate(lines):
    if 'export default function UploadPage()' in line:
        import_line_idx = i
        break

if import_line_idx:
    # Ajouter import Brain icon
    for i in range(import_line_idx):
        if 'import {' in lines[i] and 'lucide-react' in lines[i]:
            lines[i] = lines[i].replace('} from "lucide-react"', ', Brain } from "lucide-react"')
            break

# 2. Ajouter les états pour les prédictions (après const [processingMissing, ...])
state_insert_idx = None
for i, line in enumerate(lines):
    if 'const [processingMissing, setProcessingMissing]' in line:
        state_insert_idx = i + 1
        break

if state_insert_idx:
    new_states = """  const [predictionMethod, setPredictionMethod] = useState<'auto' | 'upload'>('auto')
  const [predictionFile, setPredictionFile] = useState<File | null>(null)
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'completed' | 'error'>('idle')
  const [trainingAlgorithm, setTrainingAlgorithm] = useState<string>('auto')

"""
    lines.insert(state_insert_idx, new_states)

# 3. Trouver où insérer le code de l'étape 3 (après l'étape 2, avant l'étape 4)
step3_insert_idx = None
for i, line in enumerate(lines):
    if '{step === 4 && preview && preview.columns_info && (' in line:
        step3_insert_idx = i
        break

if step3_insert_idx:
    step3_ui = """
          {/* Étape 3: Prédictions ML */}
          {step === 3 && preview && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Méthode de prédiction</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Pour calculer les métriques de fairness, nous avons besoin de prédictions de modèle ML.
                Choisissez comment les obtenir :
              </p>
              
              <div className="space-y-4">
                {/* Radio buttons pour choisir la méthode */}
                <div className="grid grid-cols-2 gap-4">
                  <label 
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      predictionMethod === 'auto' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value="auto"
                      checked={predictionMethod === 'auto'}
                      onChange={(e) => setPredictionMethod('auto')}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          predictionMethod === 'auto' ? 'border-primary' : 'border-muted-foreground'
                        }`}>
                          {predictionMethod === 'auto' && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Entraînement automatique</h4>
                        <p className="text-sm text-muted-foreground">
                          Le système entraînera automatiquement un modèle ML (LogisticRegression ou XGBoost)
                        </p>
                      </div>
                    </div>
                  </label>
                  
                  <label 
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                      predictionMethod === 'upload' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="radio"
                      value="upload"
                      checked={predictionMethod === 'upload'}
                      onChange={(e) => setPredictionMethod('upload')}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          predictionMethod === 'upload' ? 'border-primary' : 'border-muted-foreground'
                        }`}>
                          {predictionMethod === 'upload' && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Uploader prédictions</h4>
                        <p className="text-sm text-muted-foreground">
                          Uploader un fichier CSV avec vos prédictions pré-calculées
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                
                {/* Options spécifiques selon la méthode */}
                {predictionMethod === 'auto' && (
                  <div className="space-y-4 mt-6">
                    <div>
                      <Label>Algorithme (optionnel)</Label>
                      <Select value={trainingAlgorithm} onValueChange={setTrainingAlgorithm}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Automatique (basé sur le cas d'usage)</SelectItem>
                          <SelectItem value="logistic_regression">Logistic Regression</SelectItem>
                          <SelectItem value="xgboost">XGBoost</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {trainingAlgorithm === 'auto' 
                          ? 'Le système choisira LogisticRegression pour scoring/recrutement, XGBoost pour support/prédiction'
                          : trainingAlgorithm === 'logistic_regression'
                          ? 'Rapide et interprétable, idéal pour scoring et recrutement'
                          : 'Plus performant, gère les non-linéarités, idéal pour support client'}
                      </p>
                    </div>
                    
                    {trainingStatus === 'training' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                          <span className="text-sm font-medium">Entraînement du modèle en cours...</span>
                        </div>
                      </div>
                    )}
                    
                    {trainingStatus === 'completed' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Modèle entraîné avec succès !</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {predictionMethod === 'upload' && (
                  <div className="mt-6">
                    <Label>Fichier de prédictions (CSV)</Label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setPredictionFile(e.target.files?.[0] || null)}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Le fichier doit contenir les colonnes : <code className="bg-muted px-1 rounded">prediction</code> (obligatoire), 
                      <code className="bg-muted px-1 rounded ml-1">probability</code> (optionnel)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Retour
                </Button>
                <Button 
                  onClick={async () => {
                    if (predictionMethod === 'auto') {
                      // Lancer l'entraînement
                      setTrainingStatus('training')
                      try {
                        const response = await fetch(`${API_URL}/ml/datasets/${preview.dataset_id}/auto-train`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({
                            target_column: config.target_column || preview.columns_info[0].name,
                            feature_columns: null,
                            algorithm: trainingAlgorithm === 'auto' ? null : trainingAlgorithm,
                            use_case: config.use_case
                          })
                        })
                        if (response.ok) {
                          setTrainingStatus('completed')
                          setTimeout(() => setStep(4), 1500)
                        } else {
                          setTrainingStatus('error')
                        }
                      } catch (error) {
                        setTrainingStatus('error')
                      }
                    } else {
                      // Upload prédictions
                      if (!predictionFile) {
                        alert('Veuillez sélectionner un fichier')
                        return
                      }
                      const formData = new FormData()
                      formData.append('predictions_file', predictionFile)
                      try {
                        const response = await fetch(`${API_URL}/ml/datasets/${preview.dataset_id}/upload-predictions`, {
                          method: 'POST',
                          credentials: 'include',
                          body: formData
                        })
                        if (response.ok) {
                          setStep(4)
                        }
                      } catch (error) {
                        console.error(error)
                      }
                    }
                  }}
                  disabled={trainingStatus === 'training' || (predictionMethod === 'upload' && !predictionFile)}
                >
                  {predictionMethod === 'auto' ? 'Entraîner le modèle' : 'Uploader prédictions'}
                </Button>
              </div>
            </Card>
          )}

"""
    lines.insert(step3_insert_idx, step3_ui)

# Écrire le fichier
with open('app/dashboard/upload/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✅ UI de l'étape Prédictions ajoutée!")
