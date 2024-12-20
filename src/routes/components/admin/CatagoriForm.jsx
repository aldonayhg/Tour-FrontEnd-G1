import React, { useEffect, useState } from 'react';
import "./admin.css";
import { useContextGlobal } from '../../../utils/GlobalContext';
import { createCategory, deleteCategory, updateCategory } from '../../../api/categories';
import { handleClick, showErrorAlert, spinner } from '../../../api/alert';

export const CatalagoForm = () => {
    const { state, dispatch } = useContextGlobal();
    const [categorias, setCategorias] = useState(state.catagorias || []);
    const [newCatalogo, setNewCatalogo] = useState({id:'', name: '', image: null , descripcion:'' });
    const [editingCatalogo, setEditingCatalogo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpenInputs, setIsOpenInputs] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      spinner(loading)
    }, [loading]);

    useEffect(() => {
      setCategorias(state.categorias || []);
    }, [state.categorias]);
    
    const handleInputChange = (e) => {
      const { name, value, files } = e.target;
      setNewCatalogo({
        ...newCatalogo,
        [name]: name === 'image' ? files[0] : value,
      });
    };
  
    const handleAddCatalog = async () => {
      if (!newCatalogo.name || !newCatalogo.image) {
        showErrorAlert('Por favor, complete todos los campos');
        return;
      }
  
      const isDuplicateName = categorias.some(
        (categoria) => categoria?.name === newCatalogo.name && categoria?.id !== newCatalogo.id
      );
      if (isDuplicateName) {
        showErrorAlert('Ya existe una categoria con ese nombre. Por favor, elija un nombre diferente.');
        return;
      }
  
      const formData = new FormData();
      formData.append('name', newCatalogo.name);
      formData.append('descripcion', newCatalogo.descripcion || " ");
      formData.append('image', newCatalogo.image);
  
      try {
        setLoading(true);
        const response = await createCategory(formData)
        setCategorias((prevCategorias) => {
          const updatedCategorias = [...prevCategorias, response];
          dispatch("PUT_CATEGORIAS", updatedCategorias);
          return updatedCategorias;
        });
        setNewCatalogo({ id: '', name: '', image: null , descripcion:'' });
        setIsOpenInputs(false);
      } catch (error) {
        showErrorAlert(error.response.data || 'Error al agregar la categoría' )
      } finally {
        setLoading(false);
      }
    };
  
    const handleEditCatalog = (catalogo) => {
      setEditingCatalogo(catalogo);
      setNewCatalogo({ id: catalogo.id, name: catalogo.name, image: catalogo.image, descripcion: catalogo.descripcion });
    };
  
    const handleSaveEdit = async () => {
      const formData = new FormData();
      formData.append('name', newCatalogo.name);
      formData.append('image', newCatalogo.image);
      formData.append('descripcion', newCatalogo.descripcion);
  
      try {
        setLoading(true);
        const response = await updateCategory(newCatalogo.id,formData)
        const updatedCategory = response.data;
        const updatedFeatures = categorias.map((f) =>
          f.id === updatedCategory.id ? updatedCategory : f
        );
        dispatch("PUT_CATEGORIAS", updatedFeatures);
        setEditingCatalogo(null);
        setNewCatalogo({ id: '', name: '', image: null, descripcion: '' });
      } catch (error) {
        showErrorAlert('Error al editar la categoría');
      } finally {
        setLoading(false);
      }
    };
  
    const handleDeleteFeature = async (featureId) => {
      try {
        setLoading(true);
        await deleteCategory(featureId)
        const updatedFeatures = categorias.filter((f) => f.id !== featureId);
        dispatch("PUT_CATEGORIAS", updatedFeatures);
        setCategorias(updatedFeatures)
      } catch (error) {
        showErrorAlert('Error al eliminar la categoría')
      } finally {
        setLoading(false);
      }
    };

  
    const openModal = () => setIsModalOpen(true);
    const openInputs = () => setIsOpenInputs(!isOpenInputs);
    const closeModal = () => {
      setIsModalOpen(false);
      setIsOpenInputs(false);
      setEditingCatalogo(null);
      setNewCatalogo({ name: '', image: '' });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewCatalogo({ ...newCatalogo, image: file });
          };
      };

    const getImageSrc = (image) => {
      if (image instanceof File) {
        return URL.createObjectURL(image);
      }
      return image; 
    };
  
    return (
      <div className="characteristics-form">
        <button onClick={openModal} className="btn-open-characterist">
          Categorías
        </button>
        {isModalOpen && (
        <div className="modal-overlay">
            <div className="modal-content model-catalog">
                <div className='header-catalog'>
                <div className='content-title'>

                    <h2 className="text-xl font-bold mb-4 item1">Administrar Categorías</h2>
                    {!isOpenInputs &&
                    <button onClick={openInputs} className="button-add btn-add item2">
                        <i className="fa fa-plus" aria-hidden="true"></i> Añadir
                    </button>
                    }
                </div>
                {isOpenInputs && (
                    
                  <>
                    <div className='content-catalog-form'>
                        <div className="catalog-form mb-4 item2">
                            <input
                                type="text"
                                name="name"
                                value={newCatalogo.name}
                                onChange={handleInputChange}
                                placeholder="Nombre"
                                className="input-field-form"
                                />
                                
                                <input
                                type="text"
                                name="descripcion"
                                value={newCatalogo.descripcion}
                                onChange={handleInputChange}
                                placeholder="Descripción"
                                className="input-field-form"/>
                                
                            <div className="input-group content-preview-image">
                                {newCatalogo.image && (
                                    <img src={getImageSrc(newCatalogo.image)} alt="Imagen seleccionada" className="catalog-image-form " />
                                )}
                                <label htmlFor="image-upload" className="upload-label">
                                    <i className="fa fa-upload" aria-hidden="true"></i> Subir Imagen
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    name="image"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="input-image hide-input-image"
                                    />
                            </div>
                        </div>
                        <div className='content-btns-form'>
                            <button onClick={openInputs} className="button-close item1">
                                Cancelar
                            </button>
                            <button onClick={handleAddCatalog} className="button-add btn-add ">
                                + agregar
                            </button>
                        </div>
                    </div>
                    <hr/>
                    </>
                )}
                </div>
                {/* Listado  */}
                {!isOpenInputs && (
                <>
                <ul className="feature-list">
                  <li className="feature-header flex justify-between items-center">
                      <span className="header-item">Nombre</span>
                      <span className="header-item">Descripción</span>
                      <span className="header-item">Imagen</span>
                      <span className="header-item">Acciones</span>
                  </li>
                    {categorias.map((catalogo) => (
                    <li key={catalogo?.id} className="feature-item flex justify-between items-center">
                    <input
                        type="text"
                        name="name"
                        value={editingCatalogo && newCatalogo?.id == catalogo?.id ? newCatalogo?.name :catalogo?.name }
                        onChange={handleInputChange}
                        className={"input-field " +   (newCatalogo?.id == catalogo?.id ? "selected-input" : "") }
                        disabled ={!editingCatalogo || !(newCatalogo?.id == catalogo?.id) }
                    />
                    <input
                        type="text"
                        name="descripcion"
                        value={editingCatalogo && newCatalogo?.id == catalogo?.id ? newCatalogo?.descripcion : catalogo?.descripcion}
                        onChange={handleInputChange}
                        className={"textarea-field " + (newCatalogo?.id == catalogo?.id ? "selected-input" : "")}
                        disabled={!editingCatalogo || !(newCatalogo?.id == catalogo?.id)}
                        rows={3} // Configura un mínimo de líneas visibles
                        style={{ height: 'auto', overflow: 'hidden' }}
                    />
                    {(newCatalogo?.id != catalogo?.id) ? (
                        catalogo?.image && <img src={catalogo?.image} alt="Catalog" className="catalog-image" />
                        ) : (
                            <div className='content-preview-image'>
                            {newCatalogo?.image && <img src={newCatalogo?.image} alt="Imagen seleccionada" className='catalog-image' />}
                            <input
                            type="file"
                            id="image-upload"
                            name="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="input-image  hide-input-image"
                            />
                            <label htmlFor="image-upload" className="upload-label">
                                    <i className="fa fa-upload" aria-hidden="true"></i> Cambiar Imagen
                            </label>
                          </div>
                    )}
                    <div className="feature-actions flex gap-2">
                      
                      {editingCatalogo && newCatalogo?.id == catalogo?.id ? (
                      <>
                        <button onClick={handleSaveEdit} className="button-add btn-add item2">
                          Guardar
                        </button>
                        <button onClick={() => handleEditCatalog()} className="button-delete btn-characterist" >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button  onClick={() => handleEditCatalog(catalogo)}  className="button-edit btn-characterist" >
                          Editar
                        </button>
                        <button onClick={() => handleClick(() => handleDeleteFeature(catalogo?.id), null)}
                          className="button-delete btn-characterist">
                          Eliminar
                        </button>
                      </>
                    )}
                    </div>
                  </li>
                ))}
              </ul>

              <button onClick={closeModal} className="button-close">
                Cerrar
              </button>
              </>   
            )}
            </div>
        </div>
      )}
    </div>
  );
}
