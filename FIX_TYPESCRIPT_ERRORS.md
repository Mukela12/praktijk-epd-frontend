# TypeScript Error Fixes

## Common Errors and Solutions

### 1. StatusBadge type prop
**Error**: Type '"priority"' is not assignable to type...

**Valid types**:
- 'new', 'viewed', 'scheduled', 'starting', 'active', 'discontinued'
- 'paid', 'partial', 'overdue', 'collection', 'legal'
- 'pending', 'suspended', 'processing', 'general', 'waiting_list', 'client'

**Fixes needed**:
- Replace 'priority' with 'general'
- Replace 'status' with 'active'
- Replace 'count' with 'general'
- Replace 'appointment' with 'scheduled'
- Replace 'payment' with 'paid'
- Replace 'insurance' with 'general'
- Replace 'category' with 'general'

### 2. Button variant prop
**Error**: Type '"ghost"' is not assignable to type...

**Valid variants**: 
- 'primary', 'secondary', 'success', 'warning', 'outline', 'danger'

**Fix**: Replace all 'ghost' with 'outline'

### 3. LoadingSpinner size prop
**Error**: Type '"lg"' is not assignable to type...

**Valid sizes**: 'small', 'medium', 'large'

**Fixes**:
- Replace 'lg' with 'large'
- Replace 'sm' with 'small'
- Replace 'md' with 'medium'

### 4. Missing confirm method in useAlert
**Error**: Property 'confirm' does not exist on type...

**Solution**: The useAlert hook only provides success, error, warning, and info methods. 
Replace confirm calls with window.confirm() or implement a custom confirm dialog.

### 5. PremiumEmptyState props
**Error**: Property 'actionLabel' does not exist...

**Solution**: Check the actual interface and use the correct prop names.

### 6. TextField number type props
**Error**: Property 'min' does not exist on type...

**Solution**: Use NumberField component instead of TextField with type="number"

## Files to Fix

1. `/src/components/messaging/MessagesManagement.tsx`
2. `/src/pages/roles/admin/appointments/AppointmentsManagement.tsx`
3. `/src/pages/roles/therapist/treatment-codes/TreatmentCodesManagement.tsx`
4. `/src/components/crud/InlineCrudLayout.tsx`

## Quick Fix Script

```bash
# Fix StatusBadge types
find . -name "*.tsx" -type f -exec sed -i '' 's/type="priority"/type="general"/g' {} +
find . -name "*.tsx" -type f -exec sed -i '' 's/type="status"/type="active"/g' {} +
find . -name "*.tsx" -type f -exec sed -i '' 's/type="count"/type="general"/g' {} +
find . -name "*.tsx" -type f -exec sed -i '' 's/type="appointment"/type="scheduled"/g' {} +
find . -name "*.tsx" -type f -exec sed -i '' 's/type="payment"/type="paid"/g' {} +
find . -name "*.tsx" -type f -exec sed -i '' 's/type="insurance"/type="general"/g' {} +
find . -name "*.tsx" -type f -exec sed -i '' 's/type="category"/type="general"/g' {} +

# Fix Button variants
find . -name "*.tsx" -type f -exec sed -i '' 's/variant="ghost"/variant="outline"/g' {} +

# Fix confirm calls
find . -name "*.tsx" -type f -exec sed -i '' 's/confirm(/window.confirm(/g' {} +
```