'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Search, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  description: string;
  gpa: string;
  honors: string;
  institutionLogo: string;
  currentStudent: boolean;
  sortOrder: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export default function EducationPage() {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    location: '',
    description: '',
    gpa: '',
    honors: '',
    institutionLogo: '',
    currentStudent: false,
    sortOrder: 0,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const response = await fetch('/api/education');
      const data = await response.json();
      setEducations(data.data.education || []);
    } catch (error) {
      toast.error('Failed to fetch education records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const educationData = {
      ...formData,
      sortOrder: parseInt(formData.sortOrder.toString()),
    };

    const url = editingEducation ? `/api/education/${editingEducation.id}` : '/api/education';
    const method = editingEducation ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(educationData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(editingEducation ? 'Education updated successfully' : 'Education created successfully');
        setIsDialogOpen(false);
        resetForm();
        fetchEducation();
      } else {
        toast.error(result.error || 'Failed to save education record');
      }
    } catch (error) {
      toast.error('Failed to save education record');
    }
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    setFormData({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      location: education.location,
      description: education.description || '',
      gpa: education.gpa || '',
      honors: education.honors || '',
      institutionLogo: education.institutionLogo || '',
      currentStudent: education.currentStudent,
      sortOrder: education.sortOrder,
      startDate: education.startDate ? new Date(education.startDate).toISOString().split('T')[0] : '',
      endDate: education.endDate ? new Date(education.endDate).toISOString().split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education record?')) return;

    try {
      const response = await fetch(`/api/education/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Education record deleted successfully');
        fetchEducation();
      } else {
        toast.error('Failed to delete education record');
      }
    } catch (error) {
      toast.error('Failed to delete education record');
    }
  };

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      field: '',
      location: '',
      description: '',
      gpa: '',
      honors: '',
      institutionLogo: '',
      currentStudent: false,
      sortOrder: 0,
      startDate: '',
      endDate: '',
    });
    setEditingEducation(null);
  };

  const formatDateRange = (startDate: string, endDate: string | null, currentStudent: boolean) => {
    const start = new Date(startDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
    if (currentStudent) {
      return `${start} - Present`;
    }
    if (endDate) {
      const end = new Date(endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
      return `${start} - ${end}`;
    }
    return start;
  };

  if (loading) {
    return <div className="p-6">Loading education records...</div>;
  }

  const sortedEducations = [...educations].sort((a, b) => {
    if (a.currentStudent && !b.currentStudent) return -1;
    if (!a.currentStudent && b.currentStudent) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Education</h1>
          <p className="text-muted-foreground">Manage your academic background</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEducation ? 'Edit Education' : 'Add New Education'}</DialogTitle>
              <DialogDescription>
                {editingEducation ? 'Update education details below.' : 'Fill in details to add a new education record.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution *</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="University or school name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree *</Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="e.g., Bachelor of Science"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="field">Field of Study *</Label>
                  <Input
                    id="field"
                    value={formData.field}
                    onChange={(e) => setFormData(prev => ({ ...prev, field: e.target.value }))}
                    placeholder="e.g., Computer Science"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    disabled={formData.currentStudent}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gpa">GPA/Grade</Label>
                  <Input
                    id="gpa"
                    value={formData.gpa}
                    onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                    placeholder="e.g., 3.8 or First Class"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institutionLogo">Institution Logo URL</Label>
                  <Input
                    id="institutionLogo"
                    type="url"
                    value={formData.institutionLogo}
                    onChange={(e) => setFormData(prev => ({ ...prev, institutionLogo: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description of your studies and achievements"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="honors">Honors and Distinctions</Label>
                <Textarea
                  id="honors"
                  value={formData.honors}
                  onChange={(e) => setFormData(prev => ({ ...prev, honors: e.target.value }))}
                  placeholder="Any honors, awards, or special recognitions"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="currentStudent"
                    checked={formData.currentStudent}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        currentStudent: checked,
                        endDate: checked ? '' : prev.endDate
                      }));
                    }}
                  />
                  <Label htmlFor="currentStudent">Current Student</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEducation ? 'Update' : 'Create'} Education
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {sortedEducations.map((education) => (
          <Card key={education.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {education.institutionLogo && (
                    <img
                      src={education.institutionLogo}
                      alt={education.institution}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{education.degree}</CardTitle>
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span className="font-medium">{education.institution}</span>
                      <span>•</span>
                      <span>{education.field}</span>
                      {education.location && <span>• {education.location}</span>}
                      {education.currentStudent && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Current</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateRange(education.startDate, education.endDate, education.currentStudent)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(education)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(education.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {education.description && (
                  <p className="text-sm">{education.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {education.gpa && (
                    <div>
                      <span className="font-medium">GPA/Grade:</span> {education.gpa}
                    </div>
                  )}
                  {education.honors && (
                    <div>
                      <span className="font-medium">Honors:</span> {education.honors}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedEducations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No education records added yet.</p>
        </div>
      )}
    </div>
  );
}